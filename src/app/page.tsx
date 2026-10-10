import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { activeModules, modules } from "@/config/modules";
import KindnessModule from "@/modules/kindness/KindnessModule";
import MoodModule from "@/modules/mood/MoodModule";

export default function Today() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col items-center gap-8 px-4 pt-4">
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
  const upcoming = modules.filter((m) => !m.active);

  return (
    <>
      {active.includes("mood") && (
        <MoodModule>
          {active.includes("story") && (
            <NextCard href="/story" emoji="📖" title="Today's story needs a line" text="Vote for the next sentence of the world's story, or write your own." />
          )}
          {active.includes("kindness") && <KindnessModule />}
          {active.includes("capsule") && (
            <NextCard href="/capsule" emoji="⏳" title="Write to the future" text="Lock a message for 1 month to 10 years. Read the ones opening today." />
          )}
        </MoodModule>
      )}

      {upcoming.length > 0 && (
        <section className="w-full">
          <p className="text-muted mb-3 text-center text-sm font-bold">Coming soon to EarthPulse</p>
          <div className="grid grid-cols-2 gap-3">
            {upcoming.map((m) => (
              <div key={m.id} className="card flex flex-col items-center gap-1 !p-4 text-center opacity-70">
                <span className="text-3xl">{m.emoji}</span>
                <span className="text-sm font-bold">{m.title}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function NextCard({ href, emoji, title, text }: { href: string; emoji: string; title: string; text: string }) {
  return (
    <Link href={href} className="card flex items-center gap-4 transition hover:bg-white/10 active:scale-[0.98]">
      <span className="text-4xl">{emoji}</span>
      <span className="flex-1">
        <span className="block font-extrabold">{title}</span>
        <span className="text-muted block text-sm">{text}</span>
      </span>
      <span className="text-gold text-2xl font-black">›</span>
    </Link>
  );
}
