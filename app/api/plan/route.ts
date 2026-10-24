import { NextResponse } from "next/server";
import { errorResponse, requireUser } from "@/lib/api";
import { askJson } from "@/lib/gemini";
import { keepSavedStops } from "@/lib/guard";
import { hoursForDay, isOpenAt } from "@/lib/hours";
import { travelMinutes } from "@/lib/maps";
import { PLAN_PROMPT, PLAN_SCHEMA, type PlanResult } from "@/lib/prompts";
import type { Place } from "@/lib/types";

type Message = { role: "user" | "flamingo"; text: string };
type Body = { messages: Message[]; today: number; now: string; utcOffsetMinutes?: number };

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Plan an outing from the user's own saved places only.
export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  const { supabase } = auth;

  try {
    const { messages, today, now, utcOffsetMinutes = 480 } = (await request.json()) as Body;

    // 1. Which city? Match the conversation against the user's own city spaces, newest message first.
    const { data: spaces } = await supabase.from("spaces").select("id, city");
    if (!spaces?.length) {
      return NextResponse.json({ reply: "You haven't saved any places yet. Save a few from Instagram first, then I can plan!" });
    }
    const userTexts = messages.filter((m) => m.role === "user").map((m) => m.text.toLowerCase()).reverse();
    const space = userTexts
      .map((text) => spaces.find((s) => text.includes(s.city.toLowerCase())))
      .find(Boolean);
    if (!space) {
      const cities = spaces.map((s) => s.city).join(", ");
      return NextResponse.json({ reply: `Which city should I plan for? You have saved places in ${cities}.` });
    }

    // 2. The user's saved places in that city: the only places the plan may use.
    const { data: rows } = await supabase.from("places").select("*").eq("space_id", space.id);
    const places = (rows ?? []) as Place[];
    const byId = new Map(places.map((p) => [p.id, p]));

    const list = places.map((p) => ({
      id: p.id,
      name: p.name,
      type: p.place_type,
      area: p.area,
      hours: p.opening_hours?.weekdayDescriptions ?? "unknown",
      rating: p.rating,
      costPerPerson: p.cost_per_person,
      busyTimes: p.busy_times,
    }));

    // 3. Gemini chooses from the list, referring to places only by id.
    const plan = await askJson<PlanResult>(
      [
        {
          text: [
            PLAN_PROMPT,
            `Today is ${DAYS[today]}, local time ${now}. City: ${space.city}.`,
            `Saved places:\n${JSON.stringify(list)}`,
            `Conversation:\n${messages.map((m) => `${m.role}: ${m.text}`).join("\n")}`,
          ].join("\n\n"),
        },
      ],
      PLAN_SCHEMA,
    );

    // 4. The guard: drop anything that isn't one of this user's saved places.
    const chosen = keepSavedStops(plan.stops, new Set(byId.keys()));

    if (!chosen.length) {
      return NextResponse.json({ reply: "Not found on your list.", stops: [], notFound: plan.notFound });
    }

    // 5. Real facts: opening hours at the suggested time, and travel time between stops.
    const day = Number.isInteger(plan.day) && plan.day >= 0 && plan.day <= 6 ? plan.day : today;
    const located = chosen.every((s) => byId.get(s.placeId)!.lat != null);
    const minutes = located
      ? await travelMinutes(
          chosen.map((s) => ({ lat: byId.get(s.placeId)!.lat!, lng: byId.get(s.placeId)!.lng! })),
          // assume about an hour at each stop before leaving for the next
          chosen.map((s) => new Date(nextOccurrence(day, s.suggestedTime, utcOffsetMinutes).getTime() + 60 * 60_000)),
        )
      : [];

    const stops = chosen.map((s, i) => {
      const place = byId.get(s.placeId)!;
      return {
        ...s,
        place,
        hoursToday: hoursForDay(place.opening_hours, day),
        openAtTime: isOpenAt(place.opening_hours, day, s.suggestedTime),
        travelMinutesFromPrevious: i === 0 ? null : (minutes[i - 1] ?? null),
      };
    });

    const result = { reply: plan.reply, day: DAYS[day], stops, notFound: plan.notFound, followUp: plan.followUp };

    // 6. Keep a record of every plan the user has seen.
    const lastRequest = messages.filter((m) => m.role === "user").at(-1)?.text ?? "";
    await supabase.from("plans").insert({ space_id: space.id, request: lastRequest, result });

    return NextResponse.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}

// The next moment it is `day` at "HH:MM" in the user's time zone, so transit times
// reflect the planned time of day rather than right now.
function nextOccurrence(day: number, time: string, utcOffsetMinutes: number): Date {
  const [h, m] = time.split(":").map(Number);
  const localNow = new Date(Date.now() + utcOffsetMinutes * 60_000);
  const target = new Date(localNow);
  target.setUTCHours(h, m, 0, 0);
  let add = (day - localNow.getUTCDay() + 7) % 7;
  if (add === 0 && target <= localNow) add = 7;
  target.setUTCDate(target.getUTCDate() + add);
  return new Date(target.getTime() - utcOffsetMinutes * 60_000);
}
