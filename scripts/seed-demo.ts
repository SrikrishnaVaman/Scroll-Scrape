// Creates (or resets) the public demo account and fills it with real Singapore places.
// Each place is looked up on Google Maps and given an AI busy-times estimate, exactly like a normal save.
//
// Run: npm run seed:demo
import { createClient } from "@supabase/supabase-js";
import { askJson } from "../lib/gemini.ts";
import { formatPriceRange, lookupPlace } from "../lib/maps.ts";
import { ENRICH_PROMPT, ENRICH_SCHEMA, type EnrichResult } from "../lib/prompts.ts";

export const DEMO_EMAIL = "demo@scrollscrape.app";
export const DEMO_PASSWORD = "flamingo-demo-2026";
const DEMO_USERNAME = "demo_flamingo";

// Places a young Singaporean might save from Instagram, with the post they "came from".
const PLACES = [
  { name: "Maxwell Food Centre", type: "hawker centre", caption: "Tian Tian chicken rice queue is worth it 🍗 #maxwell" },
  { name: "Lau Pa Sat", type: "hawker centre", caption: "Satay street after dark ✨ best supper in the CBD" },
  { name: "Pizza Fabbrica", type: "Italian pizzeria", caption: "Wood-fired pizza and pasta in a cute shophouse 🍕 great for lunch with friends" },
  { name: "Bar Cicheti", type: "Italian restaurant", caption: "Handmade pasta + natural wine. Date night sorted 🍝🕯️" },
  { name: "Tiong Bahru Bakery Eng Hoon Street", type: "bakery cafe", caption: "Kouign amann at Tiong Bahru Bakery 🥐 lazy weekend brunch" },
  { name: "Common Man Coffee Roasters Martin Road", type: "cafe", caption: "Best brunch spot by the river ☕️" },
  { name: "Gardens by the Bay", type: "park", caption: "Supertree light show at 7:45pm 🌳💡 free and magical" },
  { name: "Fort Canning Park", type: "park", caption: "Tree tunnel photo spot + picnic lawns 🌿" },
  { name: "Timezone Orchard Xchange", type: "arcade", caption: "Claw machines and racing games at Timezone, so much fun with the squad 🎮" },
  { name: "Atlas Bar", type: "cocktail bar", caption: "Art deco gin bar that feels like the Great Gatsby 🍸 cozy night out" },
];

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const admin = createClient(url, process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false } });

async function demoUserId() {
  const { data } = await admin.auth.admin.listUsers();
  const existing = data.users.find((u) => u.email === DEMO_EMAIL);
  if (existing) {
    // Reset: deleting the space cascades to its places, photos and plans.
    await admin.from("spaces").delete().eq("user_id", existing.id);
    return existing.id;
  }
  const { data: created, error } = await admin.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { username: DEMO_USERNAME },
  });
  if (error) throw error;
  return created.user.id;
}

const userId = await demoUserId();
let spaceId: string | null = null;

for (const [i, item] of PLACES.entries()) {
  const card = await lookupPlace({ name: item.name, type: item.type, city: "Singapore", country: "Singapore" });
  if (!spaceId) {
    const { data, error } = await admin
      .from("spaces")
      .insert({ user_id: userId, city: "Singapore", country: "Singapore", center_lat: 1.3521, center_lng: 103.8198 })
      .select("id")
      .single();
    if (error) throw error;
    spaceId = data.id;
  }

  const googlePrice = formatPriceRange(card.priceRange);
  const estimate = await askJson<EnrichResult>(
    [
      {
        text: [
          ENRICH_PROMPT,
          `Place: ${card.name} (${card.type})`,
          `Area: ${card.area ?? "unknown"}, Singapore`,
          googlePrice && `Google price range per person: ${googlePrice}`,
        ]
          .filter(Boolean)
          .join("\n"),
      },
    ],
    ENRICH_SCHEMA,
  );

  const { error } = await admin.from("places").insert({
    user_id: userId,
    space_id: spaceId,
    google_place_id: card.googlePlaceId,
    name: card.name,
    place_type: card.type,
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
    post_url: `https://www.instagram.com/p/scrollscrape-demo-${i + 1}/`,
    caption: item.caption,
    source: "link",
  });
  if (error) throw error;
  console.log(`${card.googlePlaceId ? "✓" : "?"} ${card.name} (${card.area ?? "no area"})`);
}

console.log(`\nDemo account ready: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
