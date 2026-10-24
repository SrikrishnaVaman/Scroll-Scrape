import { NextResponse } from "next/server";
import type { Part } from "@google/genai";
import { errorResponse, requireUser } from "@/lib/api";
import { askJson } from "@/lib/gemini";
import { lookupPlace } from "@/lib/maps";
import { IDENTIFY_PROMPT, IDENTIFY_SCHEMA, type IdentifyResult } from "@/lib/prompts";

type Body = {
  url: string;
  caption?: string;
  comments?: string;
  screenshot?: { mimeType: string; data: string };
  answers?: { question: string; answer: string }[];
};

// Gemini reads the post and names the place; Google Maps then supplies the facts.
export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  try {
    const body = (await request.json()) as Body;

    const text = [
      IDENTIFY_PROMPT,
      `Post link: ${body.url}`,
      body.caption && `Caption:\n${body.caption}`,
      body.comments && `Comments:\n${body.comments}`,
      body.answers?.length &&
        `The user answered:\n${body.answers.map((a) => `- ${a.question} ${a.answer}`).join("\n")}`,
    ]
      .filter(Boolean)
      .join("\n\n");

    const parts: Part[] = [{ text }];
    if (body.screenshot) parts.push({ inlineData: body.screenshot });

    const found = await askJson<IdentifyResult>(parts, IDENTIFY_SCHEMA);

    if (found.confidence === "low" || !found.placeName) {
      // First ask for comments; if comments (or answers) still don't settle it, ask questions.
      if (!body.comments && !body.answers?.length) {
        return NextResponse.json({ needs: "comments" });
      }
      if (!body.answers?.length) {
        const questions = found.questions.length
          ? found.questions
          : ["What's the name of the place?", "Which city or area is it in?", "What kind of place is it?"];
        return NextResponse.json({ needs: "questions", questions });
      }
    }

    const card = await lookupPlace({
      name: found.placeName,
      type: found.placeType,
      city: found.city,
      country: found.country,
    });
    return NextResponse.json({ card });
  } catch (error) {
    return errorResponse(error);
  }
}
