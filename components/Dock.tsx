"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Bookmark, CirclePlus, MessageCircleHeart, User } from "lucide-react";

const BUTTONS = [
  { href: "/", label: "Home", Icon: House },
  { href: "/saved", label: "Saved", Icon: Bookmark },
  { href: "/add", label: "Add", Icon: CirclePlus },
  { href: "/plan", label: "Plan", Icon: MessageCircleHeart },
  { href: "/profile", label: "Profile", Icon: User },
];

// The floating bottom dock: the only navigation the app needs.
export default function Dock() {
  const path = usePathname();

  return (
    <nav className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full border border-line bg-surface px-3 py-2 shadow-lg">
      <ul className="flex gap-1">
        {BUTTONS.map(({ href, label, Icon }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex w-16 flex-col items-center gap-0.5 rounded-full py-1.5 text-xs font-semibold transition-colors ${
                  active ? "bg-flamingo text-white" : "text-muted hover:text-ink"
                }`}
              >
                <Icon size={20} strokeWidth={2.2} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
