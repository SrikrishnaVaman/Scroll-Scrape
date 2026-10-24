import FlamingoSays from "@/components/FlamingoSays";

export default function AddPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold">Add</h1>
      <FlamingoSays>
        <p className="text-muted">Saving posts arrives in the next step of the build.</p>
      </FlamingoSays>
    </div>
  );
}
