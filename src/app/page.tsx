import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { activeModules } from "@/config/modules";
import KindnessModule from "@/modules/kindness/KindnessModule";
import MoodModule from "@/modules/mood/MoodModule";

export default function Today() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col items-center gap-10 px-5 pt-2">
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
          {(active.includes("story") || active.includes("capsule")) && (
            <nav aria-label="More to do today" className="card !p-0">
              <h2 className="px-5 pb-1 pt-4 text-lg font-extrabold">More to do today</h2>
              <ul className="divide-y divide-white/10">
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
