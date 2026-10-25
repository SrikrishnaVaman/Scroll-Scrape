import type { ReactNode } from "react";

// Each screen gets its own pastel colour, so the app feels bright but calm.
const TONES = {
  pink: "from-[#FFD6E1] via-[#FFE9EF] to-cream",
  peach: "from-[#FFD9C2] via-[#FFEADF] to-cream",
  lagoon: "from-[#C6E9F7] via-[#E2F4FB] to-cream",
  lilac: "from-[#E6DCFB] via-[#F2ECFD] to-cream",
  mint: "from-[#CDEFE0] via-[#E6F7EF] to-cream",
} as const;

export type Tone = keyof typeof TONES;

// A full-width coloured band with a big serif title, matching the "Where to next…" style on Home.
export default function PageHeader({
  title,
  subtitle,
  tone,
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  tone: Tone;
  children?: ReactNode;
}) {
  return (
    <header className={`relative left-1/2 -mt-8 w-screen -translate-x-1/2 bg-gradient-to-b ${TONES[tone]}`}>
      <div className="mx-auto max-w-3xl px-5 pt-10 pb-6">
        {children}
        <h1 className="font-serif text-5xl leading-tight text-ink italic sm:text-6xl">{title}</h1>
        {subtitle && <p className="mt-1 text-muted">{subtitle}</p>}
      </div>
    </header>
  );
}
