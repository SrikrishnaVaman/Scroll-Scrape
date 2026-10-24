import PlaceCard from "./PlaceCard";
import type { Place } from "@/lib/types";

export default function PlaceList({ places }: { places: Place[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {places.map((place) => (
        <li key={place.id}>
          <PlaceCard place={place} />
        </li>
      ))}
    </ul>
  );
}
