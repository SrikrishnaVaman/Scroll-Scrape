import exifr from "exifr";
import imageCompression from "browser-image-compression";
import { createClient } from "./supabase/client";

export type PhotoMeta = { lat: number | null; lng: number | null; takenAt: string | null };

// Read where and when a photo was taken from the data stored inside the file.
// This must happen BEFORE shrinking, because shrinking strips that data.
export async function readPhotoMeta(file: File): Promise<PhotoMeta> {
  try {
    // exifr works out decimal latitude/longitude from the GPS block (picking fields would skip that step).
    const data = await exifr.parse(file, { gps: true, exif: true, tiff: true });
    const taken = data?.DateTimeOriginal ?? data?.CreateDate;
    return {
      lat: typeof data?.latitude === "number" ? data.latitude : null,
      lng: typeof data?.longitude === "number" ? data.longitude : null,
      takenAt: taken instanceof Date ? taken.toISOString() : null,
    };
  } catch {
    return { lat: null, lng: null, takenAt: null };
  }
}

// Shrink to about 250 KB, upload to the private photos folder, record it, and mark the place visited.
export async function savePhoto(file: File, meta: PhotoMeta, placeId: string) {
  const supabase = createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims.sub;
  if (!userId) throw new Error("Not signed in");

  const small = await imageCompression(file, { maxSizeMB: 0.25, maxWidthOrHeight: 1600, fileType: "image/jpeg", useWebWorker: true });
  const id = crypto.randomUUID();
  const path = `${userId}/${id}.jpg`;

  const upload = await supabase.storage.from("photos").upload(path, small, { contentType: "image/jpeg" });
  if (upload.error) throw upload.error;

  const insert = await supabase.from("photos").insert({
    id,
    place_id: placeId,
    storage_path: path,
    taken_at: meta.takenAt,
    lat: meta.lat,
    lng: meta.lng,
  });
  if (insert.error) throw insert.error;

  await supabase.from("places").update({ visited: true }).eq("id", placeId);
  return { id, bytes: small.size };
}
