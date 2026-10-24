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

export const PLAN_PROMPT = `You are the flamingo in Scroll Scrape, a friendly guide who plans outings using ONLY the places
the user has personally saved. You will get the conversation so far and the user's saved places in one city.

Rules:
- Choose stops ONLY from the saved places list. Refer to each by its exact "id". Never invent a place or use one not on the list.
- Make one stop for each part of the request (for example "casual lunch" and "cozy dinner" make two stops).
- Rank candidates by how well they fit the request, then by being open at that time, rating, price and likely crowd.
- If a part of the request has no good match on the list, put a short description of that part in notFound and make no stop for it.
- purpose: a short label for the stop, such as "Casual lunch with friends" or "Cozy dinner".
- suggestedTime: 24-hour "HH:MM", sensible for the purpose and inside the place's opening hours when known.
- day: the day of the week the plan is for, 0 = Sunday ... 6 = Saturday. Use today unless the user names a day.
- reason: one short sentence on why this place fits.
- If the user accepts an offer to plan the rest of the day, return the earlier stops again plus new ones for the rest of the day.
- reply: one or two short, warm sentences from the flamingo introducing the plan. No lists, no place details.
- followUp: after a plan, offer to suggest saved places for the rest of the day, unless the day is already full; otherwise "".`;

export const PLAN_SCHEMA = {
  type: "object",
  properties: {
    reply: { type: "string" },
    day: { type: "integer" },
    stops: {
      type: "array",
      items: {
        type: "object",
        properties: {
          placeId: { type: "string" },
          purpose: { type: "string" },
          suggestedTime: { type: "string" },
          reason: { type: "string" },
        },
        required: ["placeId", "purpose", "suggestedTime", "reason"],
      },
    },
    notFound: { type: "array", items: { type: "string" } },
    followUp: { type: "string" },
  },
  required: ["reply", "day", "stops", "notFound", "followUp"],
};

export type PlanResult = {
  reply: string;
  day: number;
  stops: { placeId: string; purpose: string; suggestedTime: string; reason: string }[];
  notFound: string[];
  followUp: string;
};
