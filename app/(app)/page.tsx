import Link from "next/link";
import { Images } from "lucide-react";
import WorldMap from "@/components/WorldMap";
import { createClient } from "@/lib/supabase/server";
import { GRATICULE_PATH, LAND_PATH } from "@/lib/worldLand";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: spaces } = await supabase
    .from("spaces")
    .select("id, city, center_lat, center_lng, places(count)")
    .order("created_at");

  const cities = (spaces ?? [])
    .filter((s) => s.center_lat != null && s.center_lng != null)
    .map((s) => ({
      id: s.id,
      city: s.city,
      count: (s.places as unknown as { count: number }[])[0]?.count ?? 0,
      lat: s.center_lat!,
      lng: s.center_lng!,
    }));

  return (
    // Full-bleed: the map breaks out of the page column to fill the screen.
    <div className="relative left-1/2 -mt-8 -mb-32 w-screen -translate-x-1/2">
      <WorldMap land={LAND_PATH} graticule={GRATICULE_PATH} cities={cities} />
      <Link
        href="/memories"
        className="absolute right-6 bottom-28 flex items-center gap-1.5 rounded-full border border-line bg-surface/90 px-4 py-2 text-sm font-semibold shadow-md backdrop-blur hover:border-flamingo sm:right-10"
      >
        <Images size={16} className="text-flamingo" /> Memories
      </Link>
      {!cities.length && (
        <Link
          href="/add"
          className="absolute bottom-28 left-6 rounded-full bg-flamingo px-5 py-2 text-sm font-bold text-white shadow-md sm:left-10"
        >
          Save your first place
        </Link>
      )}
    </div>
  );
}
