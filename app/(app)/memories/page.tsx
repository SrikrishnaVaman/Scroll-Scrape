import FlamingoSays from "@/components/FlamingoSays";
import PageHeader from "@/components/PageHeader";

export default function MemoriesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Memories" tone="mint" subtitle="Photos from your outings, by place." />
      <FlamingoSays>
        <p className="text-muted">Photos from your outings will show up here, grouped by place.</p>
      </FlamingoSays>
    </div>
  );
}
