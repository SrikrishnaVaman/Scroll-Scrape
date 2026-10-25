import Link from "next/link";
import { Clock, Star, TriangleAlert, Users, Wallet } from "lucide-react";
import EstimateChip from "./EstimateChip";
import type { Place } from "@/lib/types";

export type Stop = {
  placeId: string;
  purpose: string;
  suggestedTime: string;
  reason: string;
  place: Place;
  hoursToday: string | null;
  openAtTime: boolean | null;
  travelMinutesFromPrevious: number | null;
};

// One stop in the flamingo's plan, linking to the place's details.
const ACCENTS = ["border-l-flamingo", "border-l-lagoon", "border-l-coral", "border-l-violet-400", "border-l-emerald-400"];

export default function PlanStop({ stop, index = 0 }: { stop: Stop; index?: number }) {
  const { place } = stop;
  return (
    <Link
      href={`/place/${place.id}`}
      className={`block rounded-card border border-l-8 border-line bg-surface p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${ACCENTS[index % ACCENTS.length]}`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-wide text-flamingo">{stop.purpose}</p>
        <p className="rounded-full bg-flamingo/10 px-3 py-0.5 font-serif text-xl text-flamingo-dark italic">{stop.suggestedTime}</p>
      </div>
      <p className="text-lg font-bold">{place.name}</p>
      <p className="text-sm text-muted">
        {[place.place_type, place.area].filter(Boolean).join(" · ")}
      </p>
      <p className="mt-1 text-sm italic text-muted">{stop.reason}</p>

      <ul className="mt-3 flex flex-col gap-1.5 text-sm">
        <li className="flex items-start gap-2">
          <Clock size={16} className="mt-0.5 shrink-0 text-lagoon" />
          <span>
            {stop.hoursToday ?? "Hours not available"}
            {stop.openAtTime === false && (
              <span className="ml-2 inline-flex items-center gap-1 font-semibold text-flamingo-dark">
                <TriangleAlert size={14} /> Closed at {stop.suggestedTime}
              </span>
            )}
          </span>
        </li>
        <li className="flex items-start gap-2">
          <Users size={16} className="mt-0.5 shrink-0 text-lagoon" />
          <span>
            {place.busy_times ?? "Not available"}
            <EstimateChip />
          </span>
        </li>
        <li className="flex items-center gap-2">
          <Wallet size={16} className="shrink-0 text-lagoon" />
          {place.cost_per_person ? `${place.cost_per_person} per person` : "Cost not available"}
        </li>
        <li className="flex items-center gap-2">
          <Star size={16} className="shrink-0 text-lagoon" />
          {place.rating != null ? `${place.rating} (${place.rating_count?.toLocaleString()} reviews)` : "Rating not available"}
        </li>
      </ul>
    </Link>
  );
}
