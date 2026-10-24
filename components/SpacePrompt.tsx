"use client";

import FlamingoSays from "./FlamingoSays";

// The flamingo asks before creating a new city space.
export default function SpacePrompt({ city, busy, onYes, onNo }: { city: string; busy: boolean; onYes: () => void; onNo: () => void }) {
  return (
    <FlamingoSays>
      <p className="font-semibold">You don&apos;t have a space for {city} yet. Shall I create one?</p>
      <div className="mt-3 flex gap-2">
        <button onClick={onYes} disabled={busy} className="rounded-full bg-flamingo px-4 py-1.5 text-sm font-bold text-white disabled:opacity-60">
          Yes, create it
        </button>
        <button onClick={onNo} disabled={busy} className="rounded-full border border-line px-4 py-1.5 text-sm font-semibold text-muted">
          No
        </button>
      </div>
    </FlamingoSays>
  );
}
