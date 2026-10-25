import FlamingoSays from "@/components/FlamingoSays";

export default function MemoriesPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Memories</h1>
      <FlamingoSays>
        <p className="text-muted">Photos from your outings will show up here, grouped by place.</p>
      </FlamingoSays>
    </div>
  );
}
