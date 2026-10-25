import "server-only";
import { createClient } from "./supabase/server";

export type MemoryPhoto = { id: string; url: string; takenAt: string | null; placeId: string };

// The user's photos with short-lived links (the photos folder is private), newest first.
export async function getPhotos(placeId?: string): Promise<MemoryPhoto[]> {
  const supabase = await createClient();
  let query = supabase
    .from("photos")
    .select("id, storage_path, taken_at, created_at, place_id")
    .not("place_id", "is", null)
    .order("taken_at", { ascending: false, nullsFirst: false });
  if (placeId) query = query.eq("place_id", placeId);
  const { data: rows } = await query;
  if (!rows?.length) return [];

  const { data: signed } = await supabase.storage.from("photos").createSignedUrls(
    rows.map((r) => r.storage_path),
    60 * 60,
  );
  return rows.map((r, i) => ({
    id: r.id,
    url: signed?.[i]?.signedUrl ?? "",
    takenAt: r.taken_at ?? r.created_at,
    placeId: r.place_id!,
  }));
}
