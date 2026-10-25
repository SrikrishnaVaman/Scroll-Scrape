import Link from "next/link";
import FlamingoSays from "@/components/FlamingoSays";
import PageHeader from "@/components/PageHeader";
import { createClient } from "@/lib/supabase/server";

// A different pastel cover for each city card.
const COVERS = [
  "from-[#FFB8C9] to-[#FFE3D3]",
  "from-[#A9DAF0] to-[#E2F4FB]",
  "from-[#FFD3A8] to-[#FFF1DE]",
  "from-[#D8C8F7] to-[#F2ECFD]",
  "from-[#B7E8D2] to-[#E6F7EF]",
];

export default async function SavedPage() {
  const supabase = await createClient();
  const { data: spaces } = await supabase
    .from("spaces")
    .select("id, city, country, places(id, name, place_type)")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Saved" tone="peach" subtitle="Your city spaces, newest first." />
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
          {spaces.map((space, i) => (
            <li key={space.id}>
              <Link
                href={`/city/${space.id}`}
                className="block overflow-hidden rounded-card border border-line bg-surface shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
              <div className={`bg-gradient-to-br px-5 pt-5 pb-4 ${COVERS[i % COVERS.length]}`}>
              <div className="flex items-baseline justify-between">
                <h2 className="font-serif text-4xl italic">{space.city}</h2>
                <span className="text-sm text-muted">
                  {space.places.length} {space.places.length === 1 ? "place" : "places"}
                </span>
              </div>
              <p className="text-sm text-ink/60">{space.country}</p>
              </div>
              <ul className="flex flex-col gap-1 p-5 text-sm">
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
