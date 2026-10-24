import { NextResponse } from "next/server";
import { errorResponse, requireUser } from "@/lib/api";
import { askJson } from "@/lib/gemini";
import { formatPriceRange } from "@/lib/maps";
import { ENRICH_PROMPT, ENRICH_SCHEMA, type EnrichResult } from "@/lib/prompts";
import type { PlaceCard } from "@/lib/types";

type Body = {
  card: PlaceCard;
  postUrl?: string;
  caption?: string;
  source: "link" | "screenshot";
  createSpace: boolean;
};

// Save a confirmed place into its city space, creating the space only with the user's permission.
export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  const { supabase } = auth;

  try {
    const { card, postUrl, caption, source, createSpace } = (await request.json()) as Body;
    const city = card.city.trim();
    const country = card.country.trim();
    if (!card.name.trim() || !city) {
      return NextResponse.json({ error: "The place needs a name and a city." }, { status: 400 });
    }

    // Find this user's space for the city (row-level security limits the search to their own).
    const { data: existing } = await supabase
      .from("spaces")
      .select("id")
      .ilike("city", city)
      .ilike("country", country)
      .maybeSingle();

    let spaceId = existing?.id as string | undefined;
    if (!spaceId) {
      if (!createSpace) {
        return NextResponse.json({ needsSpace: true, city, country }, { status: 409 });
      }
      const { data: created, error } = await supabase
        .from("spaces")
        .insert({ city, country, center_lat: card.lat, center_lng: card.lng })
        .select("id")
        .single();
      if (error) throw error;
      spaceId = created.id;
    }

    // Google's price range is a fact; Gemini only fills the cost when Google has none,
    // and always gives the busy-times estimate (labelled as an AI estimate in the app).
    const googlePrice = formatPriceRange(card.priceRange);
    const estimate = await askJson<EnrichResult>(
      [
        {
          text: [
            ENRICH_PROMPT,
            `Place: ${card.name} (${card.type})`,
            `Area: ${card.area ?? "unknown"}, ${city}, ${country}`,
            card.address && `Address: ${card.address}`,
            googlePrice && `Google price range per person: ${googlePrice}`,
          ]
            .filter(Boolean)
            .join("\n"),
        },
      ],
      ENRICH_SCHEMA,
    );

    const { data: place, error } = await supabase
      .from("places")
      .insert({
        space_id: spaceId,
        google_place_id: card.googlePlaceId,
        name: card.name.trim(),
        place_type: card.type.trim(),
        area: card.area,
        address: card.address,
        lat: card.lat,
        lng: card.lng,
        opening_hours: card.openingHours,
        rating: card.rating,
        rating_count: card.ratingCount,
        price_level: card.priceLevel,
        price_range: card.priceRange,
        cost_per_person: googlePrice ?? estimate.costPerPerson,
        busy_times: estimate.busyTimes,
        post_url: postUrl || null,
        caption: caption ?? null,
        source,
      })
      .select("*")
      .single();
    if (error) throw error;

    return NextResponse.json({ place, spaceId });
  } catch (error) {
    return errorResponse(error);
  }
}
