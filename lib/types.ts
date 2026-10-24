// Opening hours exactly as Google Places returns them.
export type OpeningHours = {
  periods?: {
    open: { day: number; hour: number; minute: number };
    close?: { day: number; hour: number; minute: number };
  }[];
  weekdayDescriptions?: string[];
};

export type Money = { currencyCode: string; units?: string };
export type PriceRange = { startPrice?: Money; endPrice?: Money };

// What the confirmation card shows before a place is saved.
export type PlaceCard = {
  googlePlaceId: string | null;
  name: string;
  type: string;
  area: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  city: string;
  country: string;
  openingHours: OpeningHours | null;
  rating: number | null;
  ratingCount: number | null;
  priceLevel: string | null;
  priceRange: PriceRange | null;
  googleMapsUri: string | null;
};

// A row of the places table.
export type Place = {
  id: string;
  space_id: string;
  google_place_id: string | null;
  name: string;
  place_type: string | null;
  area: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  opening_hours: OpeningHours | null;
  rating: number | null;
  rating_count: number | null;
  price_level: string | null;
  price_range: PriceRange | null;
  cost_per_person: string | null;
  busy_times: string | null;
  post_url: string | null;
  caption: string | null;
  source: "link" | "screenshot" | null;
  visited: boolean;
  created_at: string;
};

export type Space = {
  id: string;
  city: string;
  country: string;
  center_lat: number | null;
  center_lng: number | null;
  created_at: string;
};
