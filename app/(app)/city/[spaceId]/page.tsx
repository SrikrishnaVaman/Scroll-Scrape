import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import CityMap from "@/components/CityMap";
import PageHeader from "@/components/PageHeader";
import PlaceList from "@/components/PlaceList";
import { createClient } from "@/lib/supabase/server";
import type { Place } from "@/lib/types";

export default async function CityPage({ params }: PageProps<"/city/[spaceId]">) {
  const { spaceId } = await params;
  const supabase = await createClient();

  // Row-level security means another user's space simply isn't found.
  const { data: space } = await supabase.from("spaces").select("*").eq("id", spaceId).maybeSingle();
  if (!space) notFound();

  const { data } = await supabase
    .from("places")
    .select("*")
    .eq("space_id", spaceId)
    .order("created_at", { ascending: false });
  const places = (data ?? []) as Place[];

  const pinned = places
    .filter((p) => p.lat != null && p.lng != null)
    .map((p) => ({ id: p.id, name: p.name, lat: p.lat!, lng: p.lng! }));
  const center = {
    lat: space.center_lat ?? pinned[0]?.lat ?? 0,
    lng: space.center_lng ?? pinned[0]?.lng ?? 0,
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={space.city}
        tone="lagoon"
        subtitle={`${places.length} saved ${places.length === 1 ? "place" : "places"} in ${space.country}`}
      >
        <Link href="/saved" className="mb-2 flex items-center gap-1 text-sm font-semibold text-muted hover:text-ink">
          <ChevronLeft size={16} /> Saved
        </Link>
      </PageHeader>
      <CityMap center={center} places={pinned} />
      <PlaceList places={places} />
    </div>
  );
}
