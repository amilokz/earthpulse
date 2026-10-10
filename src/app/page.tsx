import { Suspense } from "react";
import { connection } from "next/server";
import { activeModules, modules } from "@/config/modules";
import KindnessModule from "@/modules/kindness/KindnessModule";
import MoodModule from "@/modules/mood/MoodModule";

export default function Today() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col items-center gap-8 px-4 pb-16 pt-5">
      <header className="flex w-full items-center justify-between">
        <span className="text-xl font-black tracking-tight">
          Earth<span className="text-gold">Pulse</span>
        </span>
        <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
          </span>
          LIVE
        </span>
      </header>

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
      {active.includes("mood") && <MoodModule>{active.includes("kindness") && <KindnessModule />}</MoodModule>}

      {upcoming.length > 0 && (
        <section className="w-full">
          <p className="text-muted mb-3 text-center text-sm font-bold">Coming soon to EarthPulse</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
