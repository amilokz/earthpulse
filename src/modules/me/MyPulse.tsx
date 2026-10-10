"use client";

import Link from "next/link";
import { todayKey, useLocalState } from "@/lib/local";
import { MOODS, moodByValue, type MoodValue } from "@/lib/moods";

const DAYS = 35; // 5 hafte
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function MyPulse() {
  const local = useLocalState();
  if (local === null) return <div className="h-64 animate-pulse rounded-[1.75rem] bg-white/5" />;

  const history = local.history;
  const entries = Object.entries(history) as [string, MoodValue][];
  const end = new Date(todayKey() + "T00:00:00Z");
  const days = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(end);
    d.setUTCDate(end.getUTCDate() - (DAYS - 1 - i));
    const key = d.toISOString().slice(0, 10);
    return { key, date: d, mood: history[key] as MoodValue | undefined };
  });

  const tally = MOODS.map((m) => ({ ...m, n: entries.filter(([, v]) => v === m.value).length }));
  const top = [...tally].sort((a, b) => b.n - a.n)[0];
  const happyDays = entries.filter(([, v]) => v >= 4).length;
  const byWeekday = WEEKDAYS.map((w, i) => {
    const vals = entries.filter(([k]) => new Date(k + "T00:00:00Z").getUTCDay() === i).map(([, v]) => v);
    return { w, avg: vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null };
  });
  const best = byWeekday.filter((d) => d.avg !== null).sort((a, b) => b.avg! - a.avg!)[0];

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-4xl font-extrabold lg:text-5xl">My Pulse</h1>
        <p className="text-muted mt-2">Your moods over time. This stays on this device only, nobody else can see it.</p>
      </header>

      {entries.length === 0 ? (
        <div className="card text-center">
          <p className="text-5xl">🌱</p>
          <p className="mt-3 text-lg font-extrabold">Your calendar is empty</p>
          <p className="text-muted">Share today&apos;s mood and come back tomorrow to start your streak.</p>
          <Link href="/" className="mt-4 inline-block rounded-full bg-gold px-6 py-3 font-extrabold text-ink">
            Share today&apos;s mood
          </Link>
        </div>
      ) : (
        <>
          <section className="grid grid-cols-3 gap-3">
            <Stat value={`🔥 ${local.streak}`} label="day streak" />
            <Stat value={String(entries.length)} label={entries.length === 1 ? "day shared" : "days shared"} />
            <Stat value={`${top.emoji}`} label={`most often ${top.label.toLowerCase()}`} />
          </section>

          <section className="card">
            <h2 className="mb-4 text-xl font-extrabold">Last 5 weeks</h2>
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {days.map((d) => {
                const m = d.mood ? moodByValue(d.mood) : null;
                const isToday = d.key === todayKey();
                return (
                  <div
                    key={d.key}
                    title={`${d.key}${m ? `: ${m.label}` : ""}`}
                    className={`flex aspect-square items-center justify-center rounded-xl text-lg sm:text-2xl ${isToday ? "ring-2 ring-[var(--gold)]" : ""}`}
                    style={{ background: m ? `${m.color}40` : "rgb(255 255 255 / 0.05)" }}
                  >
                    {m ? m.emoji : <span className="text-muted text-[10px] sm:text-xs">{d.date.getUTCDate()}</span>}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="card flex flex-col gap-2">
            <h2 className="text-xl font-extrabold">What your moods say</h2>
            <p>
              You felt good or great on <b>{happyDays}</b> of the {entries.length} {entries.length === 1 ? "day" : "days"} you shared.
            </p>
            {best && entries.length >= 7 && (
              <p>
                Your best day of the week so far: <b>{best.w}</b>.
              </p>
            )}
            <div className="mt-2 flex flex-col gap-2">
              {tally.map((t) => (
                <div key={t.value} className="flex items-center gap-3 text-sm">
                  <span className="w-6 text-lg">{t.emoji}</span>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full" style={{ width: `${entries.length ? (t.n / entries.length) * 100 : 0}%`, background: t.color }} />
                  </div>
                  <span className="w-6 text-right font-bold">{t.n}</span>
                </div>
              ))}
            </div>
          </section>

          <p className="text-muted text-center text-xs">Clearing this browser&apos;s data will reset your calendar.</p>
        </>
      )}
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="card !p-4 text-center">
      <p className="display text-3xl font-extrabold">{value}</p>
      <p className="text-muted text-xs font-bold">{label}</p>
    </div>
  );
}
