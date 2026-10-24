"use client";

import Link from "next/link";
import { useState } from "react";
import { ImagePlus, X } from "lucide-react";
import ConfirmCard from "@/components/ConfirmCard";
import Flamingo from "@/components/Flamingo";
import FlamingoSays from "@/components/FlamingoSays";
import SpacePrompt from "@/components/SpacePrompt";
import { readScreenshot } from "@/lib/screenshot";
import type { Place, PlaceCard } from "@/lib/types";

type Step =
  | { name: "form" }
  | { name: "questions"; questions: string[]; answers: string[] }
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
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function identify(answers?: { question: string; answer: string }[]) {
    setBusy(screenshots.length ? "Reading your screenshots…" : "Reading the post…");
    setMessage(null);
    const shots = await Promise.all(screenshots.map(readScreenshot));
    const res = await post<{ card?: PlaceCard; needs?: "questions"; questions?: string[] }>("/api/identify", {
      url,
      caption,
      comments,
      screenshots: shots,
      answers,
    });
    setBusy(null);
    if (res.error) return setMessage(res.error);
    if (res.needs === "questions" && res.questions) {
      return setStep({ name: "questions", questions: res.questions, answers: res.questions.map(() => "") });
    }
    if (res.card) setStep({ name: "card", card: res.card, original: res.card });
  }

  function addScreenshots(files: FileList | null) {
    if (!files) return;
    setScreenshots((current) => [...current, ...Array.from(files)].slice(0, 4));
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
      source: screenshots.length ? "screenshot" : "link",
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
    setScreenshots([]);
    setShowDetails(false);
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
        <form
          onSubmit={(e) => {
            e.preventDefault();
            identify();
          }}
          className="flex flex-col gap-4 rounded-card border border-line bg-surface p-5 shadow-sm"
        >
          <p className="text-muted">Screenshot the post, or pause the reel on the frame that shows the place.</p>
          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              addScreenshots(e.dataTransfer.files);
            }}
            className="flex cursor-pointer flex-col items-center gap-2 rounded-card border-2 border-dashed border-line bg-cream px-4 py-6 text-center text-muted transition hover:border-flamingo"
          >
            <ImagePlus size={28} className="text-flamingo" />
            <span className="font-semibold text-ink">Drop screenshots here or tap to choose</span>
            <span className="text-sm">Up to 4, like paused frames from a reel</span>
            <input type="file" accept="image/*" multiple onChange={(e) => addScreenshots(e.target.files)} className="hidden" />
          </label>

          {screenshots.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {screenshots.map((file, i) => (
                <li key={i} className="flex items-center gap-1 rounded-full bg-sand/60 py-1 pr-1 pl-3 text-sm">
                  <span className="max-w-40 truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => setScreenshots(screenshots.filter((_, j) => j !== i))}
                    className="rounded-full p-0.5 hover:bg-surface"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <Label text="Caption (optional)">
            <textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={3} placeholder="Paste the caption if it names the place" className="input" />
          </Label>
          <Label text="Post link (optional, so you can open the post later)">
            <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.instagram.com/…" className="input" />
          </Label>
          {showDetails ? (
            <Label text="Comments (optional)">
              <textarea value={comments} onChange={(e) => setComments(e.target.value)} rows={2} placeholder="Paste a few comments from under the post" className="input" />
            </Label>
          ) : (
            <button type="button" onClick={() => setShowDetails(true)} className="self-start text-sm font-semibold text-lagoon">
              + Add comments from the post
            </button>
          )}

          <button
            disabled={!!busy || (!url && !screenshots.length && !caption && !comments)}
            className="self-start rounded-full bg-flamingo px-6 py-2 font-bold text-white hover:bg-flamingo-dark disabled:opacity-50"
          >
            Find the place
          </button>
        </form>
      )}

      {step.name === "questions" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            identify(step.questions.map((question, i) => ({ question, answer: step.answers[i] })));
          }}
          className="flex flex-col gap-4"
        >
          <FlamingoSays>
            <p className="font-semibold">I couldn&apos;t tell which place this is. Can you help me out?</p>
          </FlamingoSays>
          <div className="flex flex-col gap-3 rounded-card border border-line bg-surface p-5 shadow-sm">
            {step.questions.map((question, i) => (
              <Label key={i} text={question}>
                <input
                  value={step.answers[i]}
                  onChange={(e) => setStep({ ...step, answers: step.answers.map((a, j) => (j === i ? e.target.value : a)) })}
                  className="input"
                />
              </Label>
            ))}
            <div className="flex gap-2">
              <button disabled={!!busy || step.answers.every((a) => !a.trim())} className="rounded-full bg-flamingo px-5 py-2 font-bold text-white disabled:opacity-50">
                Find it
              </button>
              <button type="button" onClick={reset} className="rounded-full border border-line px-5 py-2 font-semibold text-muted">
                Cancel
              </button>
            </div>
          </div>
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
