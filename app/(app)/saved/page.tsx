import Link from "next/link";
import FlamingoSays from "@/components/FlamingoSays";
import { createClient } from "@/lib/supabase/server";

export default async function SavedPage() {
  const supabase = await createClient();
  const { data: spaces } = await supabase
    .from("spaces")
    .select("id, city, country, places(id, name, place_type)")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Saved</h1>
      {!spaces?.length ? (
        <FlamingoSays>
          <p className="font-semibold">No spaces yet.</p>
          <p className="text-muted">When you save your first place, I&apos;ll make a space for its city.</p>
          <Link href="/add" className="mt-3 inline-block rounded-full bg-flamingo px-4 py-1.5 text-sm font-bold text-white">
            Save a place
          </Link>
        </FlamingoSays>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {spaces.map((space) => (
            <li key={space.id}>
              <Link
                href={`/city/${space.id}`}
                className="block rounded-card border border-line bg-surface p-5 shadow-sm transition hover:border-flamingo"
              >
              <div className="flex items-baseline justify-between">
                <h2 className="text-xl font-bold">{space.city}</h2>
                <span className="text-sm text-muted">
                  {space.places.length} {space.places.length === 1 ? "place" : "places"}
                </span>
              </div>
              <p className="text-sm text-muted">{space.country}</p>
              <ul className="mt-3 flex flex-col gap-1 text-sm">
                {space.places.slice(0, 5).map((place) => (
                  <li key={place.id} className="truncate">
                    <span className="font-semibold">{place.name}</span>
                    <span className="text-muted"> · {place.place_type}</span>
                  </li>
                ))}
                {space.places.length > 5 && <li className="text-muted">and {space.places.length - 5} more</li>}
              </ul>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
