import { NextResponse } from "next/server";
import type { Part } from "@google/genai";
import { errorResponse, requireUser } from "@/lib/api";
import { askJson } from "@/lib/gemini";
import { lookupPlace } from "@/lib/maps";
import { IDENTIFY_PROMPT, IDENTIFY_SCHEMA, type IdentifyResult } from "@/lib/prompts";

type Body = {
  url?: string;
  caption?: string;
  comments?: string;
  screenshots?: { mimeType: string; data: string }[];
  answers?: { question: string; answer: string }[];
};

const DEFAULT_QUESTIONS = ["What's the place called?", "Which city or area is it in?", "What kind of place is it?"];

// Gemini reads the post and names the place; Google Maps then supplies the facts.
export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  try {
    const body = (await request.json()) as Body;

    // A link alone tells us nothing (the app never opens the post), so go straight to the flamingo's questions.
    const hasContent = body.caption || body.comments || body.screenshots?.length || body.answers?.length;
    if (!hasContent) {
      return NextResponse.json({ needs: "questions", questions: DEFAULT_QUESTIONS });
    }

    const text = [
      IDENTIFY_PROMPT,
      body.url && `Post link: ${body.url}`,
      body.caption && `Caption:\n${body.caption}`,
      body.comments && `Comments:\n${body.comments}`,
      body.answers?.length &&
        `The user answered:\n${body.answers.map((a) => `- ${a.question} ${a.answer}`).join("\n")}`,
    ]
      .filter(Boolean)
      .join("\n\n");

    // Screenshots can be several paused frames of a reel; Gemini reads them all together.
    const parts: Part[] = [{ text }, ...(body.screenshots ?? []).map((inlineData) => ({ inlineData }))];

    const found = await askJson<IdentifyResult>(parts, IDENTIFY_SCHEMA);

    // Not sure which place it is: ask the flamingo's questions (once). After answers, go with the best guess.
    if ((found.confidence === "low" || !found.placeName) && !body.answers?.length) {
      return NextResponse.json({
        needs: "questions",
        questions: found.questions.length ? found.questions : DEFAULT_QUESTIONS,
      });
    }

    const card = await lookupPlace({
      name: found.placeName,
      type: found.placeType,
      area: found.area,
      city: found.city,
      country: found.country,
    });
    return NextResponse.json({ card });
  } catch (error) {
    return errorResponse(error);
  }
}
