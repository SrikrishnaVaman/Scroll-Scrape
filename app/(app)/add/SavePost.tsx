"use client";

import Link from "next/link";
import { useState } from "react";
import ConfirmCard from "@/components/ConfirmCard";
import Flamingo from "@/components/Flamingo";
import FlamingoSays from "@/components/FlamingoSays";
import SpacePrompt from "@/components/SpacePrompt";
import { readScreenshot } from "@/lib/screenshot";
import type { Place, PlaceCard } from "@/lib/types";

type Step =
  | { name: "form" }
  | { name: "card"; card: PlaceCard; original: PlaceCard }
  | { name: "space"; card: PlaceCard }
  | { name: "saved"; place: Place };

async function post<T>(url: string, body: unknown): Promise<T & { error?: string; status: number }> {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return { ...(await res.json()), status: res.status };
}

export default function SavePost() {
  const [step, setStep] = useState<Step>({ name: "form" });
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [comments, setComments] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [askComments, setAskComments] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function identify(e: React.FormEvent) {
    e.preventDefault();
    setBusy("Reading the post…");
    setMessage(null);
    const shot = screenshot ? await readScreenshot(screenshot) : undefined;
    const res = await post<{ card?: PlaceCard; needs?: "comments" | "questions"; questions?: string[] }>(
      "/api/identify",
      { url, caption, comments, screenshot: shot },
    );
    setBusy(null);
    if (res.error) return setMessage(res.error);
    if (res.needs === "comments") {
      setAskComments(true);
      return setMessage("I couldn't tell which place this is. Could you paste a few comments from under the post, or add a screenshot of them?");
    }
    if (res.needs === "questions") {
      return setMessage(`Still not sure! ${res.questions?.join(" ")} Add the answers to the caption box and try again.`);
    }
    if (res.card) setStep({ name: "card", card: res.card, original: res.card });
  }

  async function lookUpAgain(card: PlaceCard) {
    setBusy("Checking Google Maps…");
    const res = await post<{ card?: PlaceCard }>("/api/lookup", card);
    setBusy(null);
    if (res.error || !res.card) return setMessage(res.error ?? "Couldn't look that up.");
    const updated = { ...res.card, type: card.type || res.card.type };
    setStep({ name: "card", card: updated, original: updated });
  }

  async function save(card: PlaceCard, createSpace: boolean) {
    setBusy("Saving…");
    setMessage(null);
    const res = await post<{ place?: Place; needsSpace?: boolean }>("/api/places", {
      card,
      postUrl: url,
      caption,
      source: screenshot ? "screenshot" : "link",
      createSpace,
    });
    setBusy(null);
    if (res.needsSpace) return setStep({ name: "space", card });
    if (res.error || !res.place) return setMessage(res.error ?? "Couldn't save that.");
    setStep({ name: "saved", place: res.place });
  }

  function reset() {
    setStep({ name: "form" });
    setUrl("");
    setCaption("");
    setComments("");
    setScreenshot(null);
    setAskComments(false);
    setMessage(null);
  }

  return (
    <div className="flex flex-col gap-5">
      {message && (
        <FlamingoSays>
          <p>{message}</p>
        </FlamingoSays>
      )}

      {busy && (
        <div className="flex items-center gap-3 text-muted">
          <Flamingo pose="talking" className="w-10 animate-bounce" />
          {busy}
        </div>
      )}

      {step.name === "form" && (
        <form onSubmit={identify} className="flex flex-col gap-4 rounded-card border border-line bg-surface p-5 shadow-sm">
          <Label text="Instagram post link">
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.instagram.com/p/…"
              className="input"
            />
          </Label>
          <Label text="Caption">
            <textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={4} placeholder="Paste the post's caption" className="input" />
          </Label>
          <Label text={askComments ? "Comments (this would really help!)" : "Comments (optional)"}>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={askComments ? 4 : 2}
              placeholder="Paste a few comments from under the post"
              className={`input ${askComments ? "border-flamingo ring-2 ring-flamingo/30" : ""}`}
            />
          </Label>
          <Label text="Or a screenshot of the post (optional)">
            <input type="file" accept="image/*" onChange={(e) => setScreenshot(e.target.files?.[0] ?? null)} className="text-sm" />
          </Label>
          <button disabled={!!busy || (!caption && !screenshot && !comments)} className="self-start rounded-full bg-flamingo px-6 py-2 font-bold text-white hover:bg-flamingo-dark disabled:opacity-50">
            Find the place
          </button>
        </form>
      )}

      {step.name === "card" && (
        <>
          <FlamingoSays>
            <p className="font-semibold">Found it! Is this the place?</p>
          </FlamingoSays>
          <ConfirmCard
            card={step.card}
            edited={step.card.name !== step.original.name || step.card.city !== step.original.city}
            busy={!!busy}
            onChange={(card) => setStep({ ...step, card })}
            onLookUpAgain={() => lookUpAgain(step.card)}
            onConfirm={() => save(step.card, false)}
            onCancel={reset}
          />
        </>
      )}

      {step.name === "space" && (
        <SpacePrompt
          city={step.card.city}
          busy={!!busy}
          onYes={() => save(step.card, true)}
          onNo={() => setStep({ name: "card", card: step.card, original: step.card })}
        />
      )}

      {step.name === "saved" && (
        <FlamingoSays>
          <p className="font-semibold">Saved {step.place.name}!</p>
          <div className="mt-3 flex gap-2">
            <Link href="/saved" className="rounded-full bg-flamingo px-4 py-1.5 text-sm font-bold text-white">
              See Saved
            </Link>
            <button onClick={reset} className="rounded-full border border-line px-4 py-1.5 text-sm font-semibold text-muted">
              Save another
            </button>
          </div>
        </FlamingoSays>
      )}
    </div>
  );
}

function Label({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-semibold">
      {text}
      {children}
    </label>
  );
}
