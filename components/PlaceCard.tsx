import Link from "next/link";
import { Check, Star } from "lucide-react";
import { placeIcon } from "./placeIcon";
import type { Place } from "@/lib/types";

// A saved place in a list: pastel tile with the type's icon, name, type, area and rating.
export default function PlaceCard({ place }: { place: Place }) {
  const { Icon, tint } = placeIcon(place.place_type);
  return (
    <Link
      href={`/place/${place.id}`}
      className="flex items-center gap-4 rounded-card border border-line bg-surface p-3 shadow-sm transition hover:border-flamingo"
    >
      <div className={`flex size-14 shrink-0 items-center justify-center rounded-xl ${tint}`}>
        <Icon size={24} className="text-ink/70" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold">{place.name}</p>
        <p className="truncate text-sm text-muted">{[place.place_type, place.area].filter(Boolean).join(" · ")}</p>
        <p className="flex items-center gap-3 text-sm text-muted">
          {place.rating != null && (
            <span className="flex items-center gap-1">
              <Star size={13} className="fill-flamingo text-flamingo" />
              {place.rating}
            </span>
          )}
          {place.visited && (
            <span className="flex items-center gap-1 font-semibold text-lagoon">
              <Check size={13} /> Visited
            </span>
          )}
        </p>
      </div>
    </Link>
  );
}
