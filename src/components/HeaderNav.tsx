"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const NAV = [
  { href: "/", emoji: "🌍", label: "Today" },
  { href: "/mood", emoji: "🗺️", label: "Countries" },
  { href: "/story", emoji: "📖", label: "Story" },
  { href: "/play", emoji: "🎮", label: "Play" },
  { href: "/kindness", emoji: "💌", label: "Kindness" },
  { href: "/capsule", emoji: "⏳", label: "Capsule" },
  { href: "/me", emoji: "🔥", label: "My Pulse" },
];

export const isActive = (path: string, href: string) => (href === "/" ? path === "/" : path.startsWith(href));

// Desktop par header mein links (mobile par bottom tabs)
export default function HeaderNav() {
  const path = usePathname();
  return (
    <nav aria-label="Main" className="hidden flex-1 justify-center lg:flex">
      <ul className="flex gap-1 rounded-full bg-white/5 p-1">
        {NAV.map((t) => (
          <li key={t.href}>
            <Link
              href={t.href}
              className={`block rounded-full px-4 py-2 text-sm font-extrabold transition ${
                isActive(path, t.href) ? "bg-gold text-ink" : "text-cream/80 hover:bg-white/10 hover:text-cream"
              }`}
            >
              {t.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
