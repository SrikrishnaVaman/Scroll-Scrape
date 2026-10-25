"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import Flamingo from "./Flamingo";
import { MAP_HEIGHT, MAP_TOP, MAP_WIDTH, toMapXY } from "@/lib/geo";

type City = { id: string; city: string; count: number; lat: number; lng: number };

const FLIGHT_MS = 1400;
const HOME = { x: 500, y: 210 }; // where the flamingo waits, in map units

// Home: a full-screen world map with a pin per city space, a big search line, and the
// flamingo, who flies to the searched city before City View opens.
// Pins and the flamingo live inside the SVG, so they stay in place however the map is cropped.
export default function WorldMap({ land, graticule, cities }: { land: string; graticule: string; cities: City[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [target, setTarget] = useState<{ x: number; y: number } | null>(null);
  const [flying, setFlying] = useState(false);
  const [facingRight, setFacingRight] = useState(true);
  const [missing, setMissing] = useState<string | null>(null);
  const box = useRef<HTMLElement>(null);
  const [aspect, setAspect] = useState(1.6);

  // Track the screen's shape: wide screens see the whole world, phones zoom in around your cities.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setAspect(entry.contentRect.width / entry.contentRect.height));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const viewBox = (() => {
    if (aspect >= 1.2) return `0 ${MAP_TOP} ${MAP_WIDTH} ${MAP_HEIGHT}`;
    const focus = cities[0] ? toMapXY(cities[0].lat, cities[0].lng) : HOME;
    const width = 340;
    const height = width / aspect;
    const x = Math.min(Math.max(focus.x - width * 0.6, 0), MAP_WIDTH - width);
    return `${x} ${focus.y - height * 0.55} ${width} ${height}`;
  })();

  // Until it flies, the flamingo waits in the middle of whatever part of the map is showing.
  const [vx, vy, vw, vh] = viewBox.split(" ").map(Number);
  const waiting = aspect >= 1.2 ? HOME : { x: vx + vw * 0.35, y: vy + vh * 0.42 };
  const flamingo = target ?? waiting;

  function flyTo(city: City) {
    const to = toMapXY(city.lat, city.lng);
    setMissing(null);
    setFacingRight(to.x >= flamingo.x);
    setFlying(true);
    setTarget(to);
    setTimeout(() => router.push(`/city/${city.id}`), FLIGHT_MS);
  }

  function search(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim().toLowerCase();
    if (!q) return;
    const match = cities.find((c) => c.city.toLowerCase() === q) ?? cities.find((c) => c.city.toLowerCase().startsWith(q));
    if (match) flyTo(match);
    else setMissing(query.trim());
  }

  return (
    <section ref={box} className="relative h-[100dvh] min-h-[520px] w-full overflow-hidden bg-[#6FBFE2]">
      <svg
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full overflow-visible"
        aria-label="World map"
      >
        <defs>
          {/* The ocean reaches past the map's edges, so the whole screen is sea whatever its shape. */}
          <radialGradient id="ocean" gradientUnits="userSpaceOnUse" cx="500" cy="200" r="700">
            <stop offset="0%" stopColor="#E3F4FB" />
            <stop offset="55%" stopColor="#A9DAF0" />
            <stop offset="100%" stopColor="#6FBFE2" />
          </radialGradient>
          <linearGradient id="land" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFF1DE" />
            <stop offset="100%" stopColor="#F8D9B4" />
          </linearGradient>
          <filter id="landShadow" x="-5%" y="-5%" width="110%" height="110%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#2F7FA8" floodOpacity="0.25" />
          </filter>
          <clipPath id="noAntarctica">
            <rect x="-2000" y="-2000" width="5000" height={2000 + MAP_TOP + MAP_HEIGHT} />
          </clipPath>
          <radialGradient id="glow">
            <stop offset="0%" stopColor="#F2668B" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#F2668B" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect x="-2000" y="-2000" width="5000" height="5000" fill="url(#ocean)" />
        <path d={graticule} fill="none" stroke="#FFFFFF" strokeOpacity="0.35" strokeWidth="0.4" />
        <path d={land} fill="url(#land)" stroke="#EBC59C" strokeWidth="0.5" filter="url(#landShadow)" clipPath="url(#noAntarctica)" />

        {cities.map((city) => {
          const { x, y } = toMapXY(city.lat, city.lng);
          const label = `${city.city} · ${city.count}`;
          return (
            <g key={city.id} onClick={() => flyTo(city)} className="cursor-pointer">
              <circle cx={x} cy={y} r="14" fill="url(#glow)" className="animate-pulse" />
              <circle cx={x} cy={y} r="3.6" fill="#F2668B" stroke="#FFFFFF" strokeWidth="1.4" />
              <rect x={x - label.length * 2.4 - 6} y={y + 7} width={label.length * 4.8 + 12} height="13" rx="6.5" fill="#FFFFFF" opacity="0.95" />
              <text x={x} y={y + 16.5} textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#2B2A33">
                {label}
              </text>
            </g>
          );
        })}

        <g
          style={{ transform: `translate(${flamingo.x}px, ${flamingo.y}px)`, transition: `transform ${FLIGHT_MS}ms ease-in-out` }}
          className="pointer-events-none"
        >
          {flying ? (
            <Flamingo pose="flying" x={-32} y={-44} width={64} height={40} transform={facingRight ? "scale(-1 1)" : undefined} className="" />
          ) : (
            <Flamingo pose="waiting" x={-21} y={-56} width={42} height={56} className="" />
          )}
        </g>
      </svg>

      {/* Soft fade so the search line reads clearly over the map */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-cream via-cream/70 to-transparent" />

      <form onSubmit={search} className="absolute inset-x-0 top-0 mx-auto flex max-w-6xl flex-col px-6 pt-8 sm:px-10">
        <div className="flex items-end gap-3 border-b border-ink/15 pb-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Where to next…"
            aria-label="Search your cities"
            className="min-w-0 flex-1 bg-transparent font-serif text-4xl text-ink italic outline-none placeholder:text-ink/45 sm:text-7xl"
          />
          <button className="mb-2 rounded-full bg-flamingo p-3 text-white shadow-md transition hover:bg-flamingo-dark" aria-label="Search">
            <ArrowRight size={22} />
          </button>
        </div>
        <p className="mt-2 text-sm text-muted">
          {cities.length
            ? `Search ${cities.length === 1 ? "your city" : `your ${cities.length} cities`}, or tap a pin.`
            : "Save your first place and I'll pin its city here."}
        </p>
      </form>

      {missing && (
        <div className="absolute bottom-32 left-1/2 w-[min(22rem,calc(100%-2rem))] -translate-x-1/2 rounded-card border border-line bg-surface p-4 text-sm shadow-lg">
          <p>
            You haven&apos;t saved anything in <b>{missing}</b> yet.
          </p>
          <Link href="/add" className="mt-2 inline-block rounded-full bg-flamingo px-3 py-1 text-xs font-bold text-white">
            Save a place
          </Link>
        </div>
      )}
    </section>
  );
}
