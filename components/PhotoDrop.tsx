"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, ImagePlus, MapPinOff } from "lucide-react";
import { nearestPlace } from "@/lib/geo";
import { readPhotoMeta, savePhoto, type PhotoMeta } from "@/lib/photos";
import { createClient } from "@/lib/supabase/client";

type SavedPlace = { id: string; name: string; lat: number | null; lng: number | null };

type Item = {
  file: File;
  preview: string;
  meta: PhotoMeta;
  status: "saving" | "saved" | "unmatched" | "skipped" | "failed";
  place?: SavedPlace;
};

// Add photos from an outing: each one is matched to the saved place it was taken at.
export default function PhotoDrop() {
  const [places, setPlaces] = useState<SavedPlace[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  // Chosen once before dropping: "" means match each photo by its location.
  const [forPlace, setForPlace] = useState("");

  useEffect(() => {
    createClient()
      .from("places")
      .select("id, name, lat, lng")
      .order("name")
      .then(({ data }) => setPlaces(data ?? []));
  }, []);

  function update(index: number, change: Partial<Item>) {
    setItems((current) => current.map((item, i) => (i === index ? { ...item, ...change } : item)));
  }

  async function attach(index: number, item: Item, place: SavedPlace) {
    update(index, { status: "saving", place });
    try {
      await savePhoto(item.file, item.meta, place.id);
      update(index, { status: "saved" });
    } catch (error) {
      console.error(error);
      update(index, { status: "failed" });
    }
  }

  async function addFiles(files: FileList | null) {
    if (!files) return;
    const start = items.length;
    const added = await Promise.all(
      Array.from(files).map(async (file) => {
        const meta = await readPhotoMeta(file);
        const chosen = places.find((p) => p.id === forPlace);
        const place =
          chosen ?? (meta.lat != null && meta.lng != null ? nearestPlace(places, { lat: meta.lat, lng: meta.lng }) : null);
        return { file, preview: URL.createObjectURL(file), meta, place: place ?? undefined, status: place ? "saving" : "unmatched" } as Item;
      }),
    );
    setItems((current) => [...current, ...added]);
    added.forEach((item, i) => item.place && attach(start + i, item, item.place));
  }

  const done = items.filter((i) => i.status === "saved").length;

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Where were these taken?
        <select value={forPlace} onChange={(e) => setForPlace(e.target.value)} className="input">
          <option value="">Work it out from each photo&apos;s location</option>
          {places.map((p) => (
            <option key={p.id} value={p.id}>
              All at {p.name}
            </option>
          ))}
        </select>
      </label>

      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          addFiles(e.dataTransfer.files);
        }}
        className="flex cursor-pointer flex-col items-center gap-2 rounded-card border-2 border-dashed border-lagoon/50 bg-gradient-to-br from-[#E2F4FB] via-[#F2ECFD] to-[#FFE3EA] px-4 py-8 text-center text-muted transition hover:border-lagoon"
      >
        <ImagePlus size={28} className="text-lagoon" />
        <span className="font-semibold text-ink">Drop photos from your outing</span>
        <span className="text-sm">
          {forPlace
            ? `They'll all go to ${places.find((p) => p.id === forPlace)?.name}.`
            : "I'll match each one to the saved place it was taken at, using its location."}
        </span>
        <input type="file" accept="image/*" multiple onChange={(e) => addFiles(e.target.files)} className="hidden" />
      </label>

      {items.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2">
          {items.map((item, i) => (
            <li key={i} className="flex gap-3 rounded-card border border-line bg-surface p-3 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element -- local preview of a file the user just picked */}
              <img src={item.preview} alt="" className="size-20 shrink-0 rounded-xl object-cover" />
              <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 text-sm">
                {item.status === "saving" && <p className="animate-pulse text-muted">Saving to {item.place?.name}…</p>}
                {item.status === "saved" && (
                  <p className="flex items-center gap-1 font-semibold text-lagoon">
                    <Check size={16} /> {item.place?.name}
                  </p>
                )}
                {item.status === "failed" && <p className="text-flamingo-dark">Couldn&apos;t save this one. Try again?</p>}
                {item.status === "skipped" && <p className="text-muted">Skipped</p>}
                {item.status === "unmatched" && (
                  <>
                    <p className="flex items-center gap-1 text-muted">
                      <MapPinOff size={14} />
                      {item.meta.lat == null ? "No location in this photo." : "Not near any saved place."}
                    </p>
                    <div className="flex gap-2">
                      <select
                        defaultValue=""
                        onChange={(e) => {
                          const place = places.find((p) => p.id === e.target.value);
                          if (place) attach(i, item, place);
                        }}
                        className="input min-w-0 flex-1 py-1 text-sm"
                      >
                        <option value="" disabled>
                          Choose a place…
                        </option>
                        {places.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      <button onClick={() => update(i, { status: "skipped" })} className="rounded-full border border-line px-3 text-xs font-semibold text-muted">
                        Skip
                      </button>
                    </div>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {done > 0 && (
        <Link href="/memories" className="self-start rounded-full bg-flamingo px-5 py-2 font-bold text-white">
          See {done} {done === 1 ? "photo" : "photos"} in Memories
        </Link>
      )}
    </div>
  );
}
