import type { SVGProps } from "react";

type Pose = "waiting" | "talking" | "flying";

// The Scroll Scrape mascot, drawn for this project so it is free to use in the demo.
export default function Flamingo({
  pose = "waiting",
  className = "w-24",
  ...svg
}: {
  pose?: Pose;
  className?: string;
} & SVGProps<SVGSVGElement>) {
  if (pose === "flying") return <FlyingFlamingo className={className} {...svg} />;
  return (
    <svg viewBox="0 0 120 160" className={className} role="img" aria-label="Flamingo" {...svg}>
      {/* standing leg and tucked leg */}
      <path d="M64 96 L64 150 M56 150 L72 150" stroke="#E0567C" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path d="M66 98 L80 116 L66 122" stroke="#E0567C" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* tail */}
      <path d="M88 76 L106 70 L96 88 Z" fill="#E0567C" />
      {/* body */}
      <ellipse cx="66" cy="82" rx="30" ry="18" fill="#F2668B" />
      {/* wing */}
      <ellipse cx="72" cy="79" rx="18" ry="10" fill="#FF9E80" opacity="0.9" />
      {/* neck */}
      <path d="M42 76 C 24 62, 28 44, 44 38 C 58 32, 58 18, 46 14" stroke="#F2668B" strokeWidth="8" strokeLinecap="round" fill="none" />
      {/* head */}
      <circle cx="46" cy="15" r="9" fill="#F2668B" />
      <circle cx="44" cy="12" r="1.8" fill="#2B2A33" />
      {/* beak */}
      <path d="M38 13 Q 29 15 30 25 L 36 19 Z" fill="#2B2A33" />
      {pose === "talking" && <path d="M38 18 Q 34 22 33 27" stroke="#2B2A33" strokeWidth="2" strokeLinecap="round" fill="none" />}
    </svg>
  );
}

// In flight: neck stretched forward, legs trailing behind, wings up.
function FlyingFlamingo({ className, ...svg }: { className: string } & SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 160 100" className={className} role="img" aria-label="Flamingo flying" {...svg}>
      <path d="M96 60 L150 66 M96 64 L148 72" stroke="#E0567C" strokeWidth="3" strokeLinecap="round" fill="none" />
      <ellipse cx="82" cy="58" rx="24" ry="12" fill="#F2668B" />
      <path d="M78 52 L58 10 L100 46 Z" fill="#FF9E80" />
      <path d="M86 50 L104 14 L108 48 Z" fill="#F2668B" opacity="0.9" />
      <path d="M60 56 C 44 54, 30 52, 18 50" stroke="#F2668B" strokeWidth="7" strokeLinecap="round" fill="none" />
      <circle cx="16" cy="50" r="8" fill="#F2668B" />
      <circle cx="14" cy="47" r="1.6" fill="#2B2A33" />
      <path d="M9 48 Q 0 50 2 60 L 7 54 Z" fill="#2B2A33" />
    </svg>
  );
}
