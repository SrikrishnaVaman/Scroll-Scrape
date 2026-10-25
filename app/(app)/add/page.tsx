import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import PhotoDrop from "@/components/PhotoDrop";
import SavePost from "./SavePost";

export default async function AddPage({ searchParams }: PageProps<"/add">) {
  const { tab } = await searchParams;
  const photos = tab === "photos";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={photos ? "Add photos" : "Save a place"}
        tone="lilac"
        subtitle={photos ? "Back from an outing? Your photos will find their places." : "Found somewhere on Instagram? Keep it here before it gets lost."}
      />
      <div className="flex gap-2">
        <Tab href="/add" active={!photos}>
          Save a post
        </Tab>
        <Tab href="/add?tab=photos" active={photos}>
          Add photos
        </Tab>
      </div>
      {photos ? <PhotoDrop /> : <SavePost />}
    </div>
  );
}

function Tab({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`rounded-full px-4 py-1.5 text-sm font-bold ${active ? "bg-flamingo text-white" : "border border-line bg-surface text-muted hover:text-ink"}`}
    >
      {children}
    </Link>
  );
}
