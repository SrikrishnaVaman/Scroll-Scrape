type Pose = "waiting" | "talking";

// The Scroll Scrape mascot, drawn for this project so it is free to use in the demo.
export default function Flamingo({
  pose = "waiting",
  className = "w-24",
}: {
  pose?: Pose;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 120 160" className={className} role="img" aria-label="Flamingo">
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
