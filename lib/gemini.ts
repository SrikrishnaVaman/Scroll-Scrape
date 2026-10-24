import "server-only";
import { GoogleGenAI, ThinkingLevel, type Part } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

// Thrown when the free daily quota is used up, so routes can show the flamingo's "short rest" message.
export class GeminiBusyError extends Error {}

// Ask Gemini one question and get back JSON in the shape of `schema`.
// Structured output means the reply always parses, so no text-scraping is needed.
export async function askJson<T>(parts: Part[], schema: object): Promise<T> {
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [{ role: "user", parts }],
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: schema,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });
    return JSON.parse(response.text ?? "{}") as T;
  } catch (error) {
    const status = (error as { status?: number }).status;
    if (status === 429 || status === 402) throw new GeminiBusyError("Gemini quota reached");
    throw error;
  }
}
