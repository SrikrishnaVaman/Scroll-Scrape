import PageHeader from "@/components/PageHeader";
import SavePost from "./SavePost";

export default function AddPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Save a place" tone="lilac" subtitle="Found somewhere on Instagram? Keep it here before it gets lost." />
      <div className="flex gap-2">
        <span className="rounded-full bg-flamingo px-4 py-1.5 text-sm font-bold text-white">Save a post</span>
        <span className="rounded-full border border-line px-4 py-1.5 text-sm font-semibold text-muted" title="Coming later in the build">
          Add photos
        </span>
      </div>
      <SavePost />
    </div>
  );
}
