// The prompts Scroll Scrape sends to Gemini, with the JSON shape each reply must follow.

export const IDENTIFY_PROMPT = `You read an Instagram post that someone saved because it shows a place they want to visit
(a restaurant, cafe, bar, park, arcade, shop, museum or similar).
Work out which single place the post is about, using the caption, any comments, the screenshot and any answers given.

Rules:
- placeName: the venue's own name as it would appear on Google Maps. Not a dish, a person or a hashtag.
- placeType: a short, specific type such as "Italian restaurant", "bubble tea shop", "bowling alley", "rooftop bar".
- city: the city the place is in (for Singapore, use "Singapore"). country: the country's English name.
- confidence: "high" only if the place name AND the city are stated or clearly implied. Otherwise "low".
- questions: when confidence is low, up to 3 short, friendly questions that would identify the place
  (for example "What's the name of the place?", "Which city or area is it in?"). Otherwise an empty list.
- If you cannot tell a field, use an empty string rather than guessing.`;

export const IDENTIFY_SCHEMA = {
  type: "object",
  properties: {
    placeName: { type: "string" },
    placeType: { type: "string" },
    city: { type: "string" },
    country: { type: "string" },
    confidence: { type: "string", enum: ["high", "low"] },
    questions: { type: "array", items: { type: "string" } },
  },
  required: ["placeName", "placeType", "city", "country", "confidence", "questions"],
};

export type IdentifyResult = {
  placeName: string;
  placeType: string;
  city: string;
  country: string;
  confidence: "high" | "low";
  questions: string[];
};

export const ENRICH_PROMPT = `You help people plan outings to a place they saved. Using general knowledge of this kind of
place, its area and its city, give:
- busyTimes: one short sentence on when it is usually busy and when it is quieter
  (for example "Busiest 12-2pm and Friday-Saturday evenings; quiet mid-afternoon on weekdays").
- costPerPerson: an approximate cost per person in the local currency, such as "about SGD 15-25".
  If a Google price range is given, base it on that.
These are estimates and will be labelled as such. Keep each under 20 words.`;

export const ENRICH_SCHEMA = {
  type: "object",
  properties: {
    busyTimes: { type: "string" },
    costPerPerson: { type: "string" },
  },
  required: ["busyTimes", "costPerPerson"],
};

export type EnrichResult = { busyTimes: string; costPerPerson: string };
