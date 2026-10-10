"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";

import { NAV, isActive } from "./HeaderNav";

const TABS = NAV.filter((t) => ["/", "/story", "/play", "/capsule", "/me"].includes(t.href)).map((t) =>
  t.href === "/me" ? { ...t, label: "Me" } : t,
);

// Bachon jaisa simple: 3 bade tabs, emoji + 1 lafz
export default function BottomNav() {
  const path = usePathname();
  if (path.startsWith("/admin")) return null;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 lg:hidden border-t border-white/10 bg-[#0e0a2e]/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
      <ul className="mx-auto flex max-w-md">
        {TABS.map((t) => {
          const active = isActive(path, t.href);
          return (
            <li key={t.href} className="flex-1">
              <Link href={t.href} className="relative flex flex-col items-center gap-0.5 py-2.5">
                {active && (
                  <motion.span layoutId="tab" className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-[var(--gold)]" />
                )}
                <motion.span whileTap={{ scale: 0.85 }} className={`text-2xl transition ${active ? "" : "opacity-50 grayscale"}`}>
                  {t.emoji}
                </motion.span>
                <span className={`text-[11px] font-extrabold ${active ? "text-gold" : "text-muted"}`}>{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
