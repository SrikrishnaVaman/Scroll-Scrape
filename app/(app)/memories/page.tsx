import Link from "next/link";
import FlamingoSays from "@/components/FlamingoSays";
import PageHeader from "@/components/PageHeader";
import PhotoGrid from "@/components/PhotoGrid";
import { getPhotos } from "@/lib/memories";
import { createClient } from "@/lib/supabase/server";

export default async function MemoriesPage() {
  const supabase = await createClient();
  const [photos, { data: places }] = await Promise.all([
    getPhotos(),
    supabase.from("places").select("id, name, area, spaces(city)").eq("visited", true),
  ]);

  // Group by place, with the place whose newest photo is most recent first.
  const groups = (places ?? [])
    .map((place) => ({ place, photos: photos.filter((p) => p.placeId === place.id) }))
    .filter((g) => g.photos.length)
    .sort((a, b) => (b.photos[0].takenAt ?? "").localeCompare(a.photos[0].takenAt ?? ""));

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Memories" tone="mint" subtitle="Photos from your outings, by place." />
      {!groups.length ? (
        <FlamingoSays>
          <p className="font-semibold">No memories yet.</p>
          <p className="text-muted">After an outing, add your photos and I&apos;ll file them under the places you visited.</p>
          <Link href="/add?tab=photos" className="mt-3 inline-block rounded-full bg-flamingo px-4 py-1.5 text-sm font-bold text-white">
            Add photos
          </Link>
        </FlamingoSays>
      ) : (
        groups.map(({ place, photos }) => (
          <section key={place.id}>
            <Link href={`/place/${place.id}`} className="group">
              <h2 className="font-serif text-3xl italic group-hover:text-flamingo-dark">{place.name}</h2>
              <p className="mb-3 text-sm text-muted">
                {[place.area, (place.spaces as unknown as { city: string }).city].filter(Boolean).join(", ")} ·{" "}
                {photos[0].takenAt && new Date(photos[0].takenAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </Link>
            <PhotoGrid photos={photos} />
          </section>
        ))
      )}
    </div>
  );
}
