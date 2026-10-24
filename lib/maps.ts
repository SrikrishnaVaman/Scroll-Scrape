import "server-only";
import type { OpeningHours, PlaceCard, PriceRange } from "./types";

const KEY = process.env.GOOGLE_MAPS_SERVER_KEY!;

const DETAIL_FIELDS = [
  "id",
  "displayName",
  "formattedAddress",
  "addressComponents",
  "location",
  "primaryTypeDisplayName",
  "googleMapsUri",
  "regularOpeningHours",
  "rating",
  "userRatingCount",
  "priceLevel",
  "priceRange",
].join(",");

type AddressComponent = { longText: string; types: string[] };

type PlaceDetails = {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  addressComponents?: AddressComponent[];
  location?: { latitude: number; longitude: number };
  primaryTypeDisplayName?: { text: string };
  googleMapsUri?: string;
  regularOpeningHours?: OpeningHours;
  rating?: number;
  userRatingCount?: number;
  priceLevel?: string;
  priceRange?: PriceRange;
};

// Text Search with an IDs-only field mask, which Google doesn't charge for.
async function findPlaceId(query: string): Promise<string | null> {
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": KEY,
      "X-Goog-FieldMask": "places.id",
    },
    body: JSON.stringify({ textQuery: query }),
  });
  if (!res.ok) throw new Error(`Places text search failed: ${res.status}`);
  const data = (await res.json()) as { places?: { id: string }[] };
  return data.places?.[0]?.id ?? null;
}

// Place Details: the facts (hours, rating, price) that are stored once at save time.
async function getDetails(placeId: string): Promise<PlaceDetails> {
  const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
    headers: { "X-Goog-Api-Key": KEY, "X-Goog-FieldMask": DETAIL_FIELDS },
  });
  if (!res.ok) throw new Error(`Place details failed: ${res.status}`);
  return (await res.json()) as PlaceDetails;
}

function component(details: PlaceDetails, ...types: string[]) {
  for (const type of types) {
    const match = details.addressComponents?.find((c) => c.types.includes(type));
    if (match) return match.longText;
  }
  return null;
}

// Look a place up on Google Maps and build the confirmation card.
// If Google finds nothing, the card keeps the AI's name and city with empty facts.
export async function lookupPlace(input: {
  name: string;
  type: string;
  city: string;
  country: string;
}): Promise<PlaceCard> {
  const empty: PlaceCard = {
    googlePlaceId: null,
    name: input.name,
    type: input.type,
    area: null,
    address: null,
    lat: null,
    lng: null,
    city: input.city,
    country: input.country,
    openingHours: null,
    rating: null,
    ratingCount: null,
    priceLevel: null,
    priceRange: null,
    googleMapsUri: null,
  };

  const id = await findPlaceId([input.name, input.city, input.country].filter(Boolean).join(", "));
  if (!id) return empty;

  const d = await getDetails(id);
  return {
    googlePlaceId: d.id,
    name: d.displayName?.text ?? input.name,
    type: input.type || d.primaryTypeDisplayName?.text || "",
    area: component(d, "neighborhood", "sublocality_level_1", "sublocality", "locality"),
    address: d.formattedAddress ?? null,
    lat: d.location?.latitude ?? null,
    lng: d.location?.longitude ?? null,
    city: input.city || component(d, "locality") || "",
    country: component(d, "country") ?? input.country,
    openingHours: d.regularOpeningHours ?? null,
    rating: d.rating ?? null,
    ratingCount: d.userRatingCount ?? null,
    priceLevel: d.priceLevel ?? null,
    priceRange: d.priceRange ?? null,
    googleMapsUri: d.googleMapsUri ?? null,
  };
}

export function formatPriceRange(range: PriceRange | null): string | null {
  if (!range?.startPrice) return null;
  const currency = range.startPrice.currencyCode;
  const start = range.startPrice.units ?? "0";
  const end = range.endPrice?.units;
  return end ? `${currency} ${start}–${end}` : `${currency} ${start}+`;
}
