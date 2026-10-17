import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "World Mood Tracker \u2014 How the World Feels Today | EarthPulse",
  description: "Live world mood tracker \u2014 share your mood in one tap and explore how every country feels today on the global mood map. Free, no login required.",
};

import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { activeModules } from "@/config/modules";
import KindnessModule from "@/modules/kindness/KindnessModule";
import MoodModule from "@/modules/mood/MoodModule";
import TodaySections from "@/modules/today/TodaySections";

export default function Today() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col items-center gap-14 px-5 pt-2 lg:px-8">
      <Suspense fallback={<div className="aspect-square w-full max-w-[560px] animate-pulse rounded-full bg-white/5" />}>
        <TodayModules />
      </Suspense>
    </main>
  );
}

// Har request par dates check hoti hain, taake event modules (start/end) khud on/off hon
async function TodayModules() {
  await connection();
  const active = activeModules().map((m) => m.id);

  return (
    <>
      {active.includes("mood") && (
        <MoodModule>
          {active.includes("kindness") && <KindnessModule />}
          {(active.includes("story") || active.includes("capsule") || active.includes("game")) && (
            <nav aria-label="More to do today" className="card !p-0">
              <h2 className="px-5 pb-1 pt-4 text-lg font-extrabold">More to do today</h2>
              <ul className="divide-y divide-white/10">
                {active.includes("game") && (
                  <NextRow href="/play" emoji="🎮" title="Play Pulse Journey" text="Cheer up the world, one match at a time. Your free hammer is waiting." />
                )}
                {active.includes("story") && (
                  <NextRow href="/story" emoji="📖" title="Add a line to the world's story" text="Vote on tomorrow's sentence, or write your own." />
                )}
                {active.includes("capsule") && (
                  <NextRow href="/capsule" emoji="⏳" title="Write to the future" text="Lock a message for 1 month up to 10 years." />
                )}
              </ul>
            </nav>
          )}
        </MoodModule>
      )}
      <TodaySections />
    </>
  );
}

function NextRow({ href, emoji, title, text }: { href: string; emoji: string; title: string; text: string }) {
  return (
    <li>
      <Link href={href} className="flex items-center gap-4 px-5 py-4 transition hover:bg-white/5 active:bg-white/10">
        <span className="text-3xl">{emoji}</span>
        <span className="flex-1">
          <span className="block font-extrabold">{title}</span>
          <span className="text-muted block text-sm">{text}</span>
        </span>
        <span aria-hidden className="text-2xl text-gold">›</span>
      </Link>
    </li>
  );
}
