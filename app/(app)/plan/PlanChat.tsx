"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { Bus, Send } from "lucide-react";
import ChatBubble from "@/components/ChatBubble";
import PlanStop, { type Stop } from "@/components/PlanStop";

type Turn = {
  role: "user" | "flamingo";
  text: string;
  day?: string;
  stops?: Stop[];
  notFound?: string[];
  followUp?: string;
};

const GREETING: Turn = {
  role: "flamingo",
  text: "Hi! What would you like to do? Tell me the city and the vibe, like \"a casual lunch with friends and a cozy dinner in Singapore\".",
};

// The planning chat. The conversation lives only in this page; finished plans are saved by the server.
export default function PlanChat() {
  const [turns, setTurns] = useState<Turn[]>([GREETING]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, busy]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || busy) return;
    const next = [...turns, { role: "user" as const, text }];
    setTurns(next);
    setDraft("");
    setBusy(true);

    // Send the whole conversation, so follow-ups like "yes, plan the afternoon too" have context.
    const messages = next.slice(1).map((t) => ({
      role: t.role,
      text: t.role === "flamingo" && t.stops?.length
        ? `${t.text} [Plan: ${t.stops.map((s) => `${s.suggestedTime} ${s.purpose} at ${s.place.name}`).join("; ")}] ${t.followUp ?? ""}`
        : t.text,
    }));
    const clock = new Date();
    const res = await fetch("/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages,
        today: clock.getDay(),
        now: clock.toTimeString().slice(0, 5),
        utcOffsetMinutes: -clock.getTimezoneOffset(),
      }),
    });
    const data = await res.json();
    setBusy(false);
    setTurns([...next, { role: "flamingo", text: data.error ?? data.reply, ...data }]);
  }

  return (
    <div className="flex flex-col gap-4">
      {turns.map((turn, i) => (
        <ChatBubble key={i} from={turn.role}>
          <p>{turn.text}</p>
          {turn.stops?.length ? (
            <div className="flex flex-col gap-2">
              {turn.day && <p className="text-xs font-bold uppercase tracking-wide text-muted">Plan for {turn.day}</p>}
              {turn.stops.map((stop) => (
                <Fragment key={stop.placeId}>
                  {stop.travelMinutesFromPrevious != null && (
                    <p className="flex items-center gap-1.5 pl-2 text-sm text-muted">
                      <Bus size={16} className="text-lagoon" />
                      {stop.travelMinutesFromPrevious} min to the next stop
                    </p>
                  )}
                  <PlanStop stop={stop} />
                </Fragment>
              ))}
            </div>
          ) : null}
          {turn.notFound?.length && turn.stops?.length ? (
            <p className="text-sm text-muted">Not found on your list: {turn.notFound.join(", ")}.</p>
          ) : null}
          {turn.followUp && <p className="font-semibold">{turn.followUp}</p>}
        </ChatBubble>
      ))}
      {busy && (
        <ChatBubble from="flamingo">
          <p className="animate-pulse text-muted">Looking through your saved places…</p>
        </ChatBubble>
      )}
      <div ref={bottom} />

      <form onSubmit={send} className="sticky bottom-24 flex gap-2 rounded-full border border-line bg-surface p-1.5 shadow-md">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Tell the flamingo what you'd like to do"
          className="min-w-0 flex-1 bg-transparent px-4 outline-none"
        />
        <button disabled={busy || !draft.trim()} className="rounded-full bg-flamingo p-2.5 text-white disabled:opacity-50" aria-label="Send">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
