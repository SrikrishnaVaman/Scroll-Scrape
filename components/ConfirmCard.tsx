"use client";

import { MapPin, Star } from "lucide-react";
import type { PlaceCard } from "@/lib/types";

type Props = {
  card: PlaceCard;
  edited: boolean;
  busy: boolean;
  onChange: (card: PlaceCard) => void;
  onLookUpAgain: () => void;
  onConfirm: () => void;
  onCancel: () => void;
};

// Shows what the AI found so the user can confirm or correct it before saving.
export default function ConfirmCard({ card, edited, busy, onChange, onLookUpAgain, onConfirm, onCancel }: Props) {
  const set = (field: "name" | "type" | "city") => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...card, [field]: e.target.value });

  return (
    <div className="flex flex-col gap-4 rounded-card border border-line bg-surface p-5 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Place" value={card.name} onChange={set("name")} />
        <Field label="Type" value={card.type} onChange={set("type")} />
        <Field label="City" value={card.city} onChange={set("city")} />
      </div>

      <div className="flex flex-col gap-1 text-sm text-muted">
        {card.googlePlaceId ? (
          <>
            <p className="flex items-start gap-1.5">
              <MapPin size={16} className="mt-0.5 shrink-0 text-flamingo" />
              {card.address}
            </p>
            {card.rating != null && (
              <p className="flex items-center gap-1.5">
                <Star size={16} className="text-flamingo" />
                {card.rating} ({card.ratingCount?.toLocaleString()} reviews on Google)
              </p>
            )}
          </>
        ) : (
          <p className="rounded-lg bg-sand/60 px-3 py-2">
            Not on Google Maps. You can still save it; hours and rating will show &quot;Not available&quot;.
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {edited ? (
          <button onClick={onLookUpAgain} disabled={busy} className="rounded-full bg-lagoon px-5 py-2 font-bold text-white disabled:opacity-60">
            Look up again
          </button>
        ) : (
          <button onClick={onConfirm} disabled={busy} className="rounded-full bg-flamingo px-5 py-2 font-bold text-white hover:bg-flamingo-dark disabled:opacity-60">
            Yes, save it
          </button>
        )}
        <button onClick={onCancel} disabled={busy} className="rounded-full border border-line px-5 py-2 font-semibold text-muted">
          Cancel
        </button>
      </div>
      {edited && <p className="text-xs text-muted">You changed the place or city, so I&apos;ll check Google Maps again first.</p>}
    </div>
  );
}

function Field(props: { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wide text-muted">
      {props.label}
      <input
        value={props.value}
        onChange={props.onChange}
        className="rounded-xl border border-line bg-cream px-3 py-2 text-base font-semibold normal-case tracking-normal text-ink outline-none focus:border-flamingo"
      />
    </label>
  );
}
