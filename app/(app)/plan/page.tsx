import FlamingoSays from "@/components/FlamingoSays";

export default function PlanPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold">Plan</h1>
      <FlamingoSays>
        <p className="text-muted">Planning with me arrives soon. Save a few places first!</p>
      </FlamingoSays>
    </div>
  );
}
