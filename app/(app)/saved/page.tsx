import FlamingoSays from "@/components/FlamingoSays";

export default function SavedPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold">Saved</h1>
      <FlamingoSays>
        <p className="text-muted">Your city spaces will show up here.</p>
      </FlamingoSays>
    </div>
  );
}
