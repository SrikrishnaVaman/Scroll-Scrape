import PageHeader from "@/components/PageHeader";
import PlanChat from "./PlanChat";

export default function PlanPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Plan a day" tone="pink" subtitle="Tell the flamingo what you feel like. It only picks from your saves." />
      <PlanChat />
    </div>
  );
}
