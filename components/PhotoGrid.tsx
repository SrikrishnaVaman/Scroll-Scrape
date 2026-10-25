// Photos in a calm masonry grid (mymind style).
export default function PhotoGrid({ photos }: { photos: { id: string; url: string }[] }) {
  return (
    <div className="columns-2 gap-3 sm:columns-3">
      {photos.map((photo) => (
        // eslint-disable-next-line @next/next/no-img-element -- signed Supabase links, already resized on upload
        <img key={photo.id} src={photo.url} alt="" className="mb-3 w-full break-inside-avoid rounded-card shadow-sm" />
      ))}
    </div>
  );
}
