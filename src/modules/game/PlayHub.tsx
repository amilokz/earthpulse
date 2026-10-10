"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { CHAPTERS, LEVELS_PER_CHAPTER, dailyLevel, getLevel, type Chapter, type Level } from "@/game/levels";
import { unlockedUpTo, updateProgress, useProgress } from "@/game/progress";
import { todayKey, useLocalState } from "@/lib/local";
import { getFacts } from "@/lib/spotlight";
import Board from "./Board";
import Skyline from "./Skyline";

export default function PlayHub() {
  const progress = useProgress();
  const local = useLocalState();
  const [level, setLevel] = useState<Level | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [postcard, setPostcard] = useState<Chapter | null>(null);

  if (!progress) return <div className="h-[70vh] animate-pulse rounded-[1.75rem] bg-white/5" />;

  const day = todayKey();
  const unlocked = unlockedUpTo(progress);
  const totalStars = Object.values(progress.stars).reduce((a, b) => a + b, 0);
  const votedToday = !!local?.history[day];
  const canClaim = votedToday && progress.moodBonusDay !== day;
  const dailyDone = progress.daily?.day === day;

  const finish = (lv: Level) => (r: { win: boolean; stars: number; score: number }) => {
    if (!r.win) return;
    updateProgress((p) => {
      if (lv.n === 0) {
        const prev = p.daily?.day === day ? p.daily : undefined;
        return { ...p, daily: { day, best: Math.max(prev?.best ?? 0, r.score), stars: Math.max(prev?.stars ?? 0, r.stars) } };
      }
      return {
        ...p,
        stars: { ...p.stars, [lv.n]: Math.max(p.stars[lv.n] ?? 0, r.stars) as 1 | 2 | 3 },
        best: { ...p.best, [lv.n]: Math.max(p.best[lv.n] ?? 0, r.score) },
      };
    });
    if (lv.boss && !progress.postcards.includes(lv.chapter.id)) {
      updateProgress((p) => ({ ...p, postcards: [...p.postcards, lv.chapter.id] }));
      setTimeout(() => setPostcard(lv.chapter), 900);
    }
  };

  if (level)
    return (
      <div className="mx-auto w-full max-w-xl">
        <Board key={`${level.n}-${attempt}`} level={level} onExit={() => setLevel(null)} onFinish={finish(level)} />
        <PostcardModal chapter={postcard} onClose={() => setPostcard(null)} />
      </div>
    );

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold lg:text-5xl">Pulse Journey</h1>
          <p className="text-muted mt-1 max-w-[46ch]">Travel the world and cheer people up. Match 3 sad faces to make them smile.</p>
        </div>
        <div className="flex gap-2 text-sm font-extrabold">
          <span className="rounded-full bg-white/10 px-3 py-2">⭐ {totalStars}</span>
          <span className="rounded-full bg-white/10 px-3 py-2">🔨 {progress.hammers}</span>
          <span className="rounded-full bg-white/10 px-3 py-2">🔀 {progress.shuffles}</span>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <button
          onClick={() => {
            setAttempt((a) => a + 1);
            setLevel(dailyLevel(day));
          }}
          className="card flex items-center gap-4 text-left transition hover:bg-white/10"
        >
          <span className="text-5xl">📅</span>
          <span className="flex-1">
            <span className="block text-lg font-extrabold">Daily challenge</span>
            <span className="text-muted block text-sm">
              {dailyDone ? `Done today · best ${progress.daily!.best.toLocaleString()} pts. Play again to beat it.` : "Same board for everyone on Earth today."}
            </span>
          </span>
          <span className="text-2xl text-gold">›</span>
        </button>

        {canClaim ? (
          <button
            onClick={() => updateProgress((p) => ({ ...p, hammers: p.hammers + 1, moodBonusDay: day }))}
            className="card flex items-center gap-4 text-left ring-2 ring-[var(--gold)] transition hover:bg-white/10"
          >
            <span className="text-5xl">🎁</span>
            <span>
              <span className="block text-lg font-extrabold">Claim your free hammer</span>
              <span className="text-muted block text-sm">Thanks for sharing your mood today.</span>
            </span>
          </button>
        ) : (
          <Link href="/" className="card flex items-center gap-4 transition hover:bg-white/10">
            <span className="text-5xl">{votedToday ? "✅" : "🎁"}</span>
            <span>
              <span className="block text-lg font-extrabold">{votedToday ? "Today's bonus claimed" : "Get a free hammer every day"}</span>
              <span className="text-muted block text-sm">{votedToday ? "Come back tomorrow for another." : "Share your mood on the Today page, then come back."}</span>
            </span>
          </Link>
        )}
      </div>

      {CHAPTERS.map((ch, ci) => {
        const first = ci * LEVELS_PER_CHAPTER + 1;
        const locked = first > unlocked;
        return (
          <section key={ch.id} aria-label={`${ch.name} chapter`} className={locked ? "opacity-60" : ""}>
            <Skyline chapter={ch}>
              <div className="flex h-40 items-end justify-between p-4 pt-10 sm:h-48">
                <div className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]">
                  <p className="display text-3xl font-extrabold text-white">
                    {ch.flag} {ch.name}
                  </p>
                  <p className="text-sm font-bold text-white/90">{locked ? `Finish ${CHAPTERS[ci - 1].name} to unlock` : ch.twist}</p>
                </div>
                {progress.postcards.includes(ch.id) && (
                  <button onClick={() => setPostcard(ch)} className="rounded-full bg-white/90 px-3 py-1.5 text-sm font-extrabold text-ink">
                    📮 Postcard
                  </button>
                )}
              </div>
            </Skyline>

            <ol className="relative mx-auto mt-4 grid max-w-md grid-cols-5 gap-x-3 gap-y-5 sm:max-w-lg">
              {Array.from({ length: LEVELS_PER_CHAPTER }, (_, i) => {
                const n = first + i;
                const open = n <= unlocked;
                const current = n === unlocked;
                const stars = progress.stars[n] ?? 0;
                const lv = getLevel(n);
                return (
                  <li key={n} className="flex flex-col items-center gap-1" style={{ transform: `translateY(${Math.sin(i * 1.2) * 8}px)` }}>
                    <motion.button
                      whileTap={open ? { scale: 0.9 } : undefined}
                      animate={current ? { scale: [1, 1.08, 1] } : undefined}
                      transition={current ? { repeat: Infinity, duration: 1.6 } : undefined}
                      disabled={!open}
                      onClick={() => {
                        setAttempt((a) => a + 1);
                        setLevel(lv);
                      }}
                      aria-label={`Level ${n}${lv.boss ? " (boss)" : ""}${open ? "" : ", locked"}`}
                      className={`display flex aspect-square w-full items-center justify-center rounded-full text-xl font-extrabold shadow-[0_5px_0_rgba(0,0,0,0.35)] ${
                        !open ? "bg-white/10 text-white/40" : current ? "bg-gold text-ink ring-4 ring-[var(--gold)]/40" : "bg-[#5b4bb0] text-white"
                      } ${lv.boss ? "!rounded-2xl" : ""}`}
                    >
                      {open ? (lv.boss ? "👑" : n) : "🔒"}
                    </motion.button>
                    <span className="h-4 text-xs leading-none">{stars ? "⭐".repeat(stars) : ""}</span>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}

      <p className="text-muted text-center text-sm">More countries are on the way. Your progress is saved on this device.</p>
      <PostcardModal chapter={postcard} onClose={() => setPostcard(null)} />
    </div>
  );
}

function PostcardModal({ chapter, onClose }: { chapter: Chapter | null; onClose: () => void }) {
  const f = chapter ? getFacts(chapter.id) : null;
  return (
    <AnimatePresence>
      {chapter && f && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-5 backdrop-blur-sm">
          <motion.div
            initial={{ rotate: -8, scale: 0.7, y: 40 }}
            animate={{ rotate: -2, scale: 1, y: 0 }}
            transition={{ type: "spring", damping: 14 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm overflow-hidden rounded-lg bg-[var(--paper)] text-ink shadow-2xl"
          >
            <Skyline chapter={chapter}>
              <div className="h-36" />
            </Skyline>
            <div className="grid grid-cols-[1fr_auto] gap-3 p-5">
              <div>
                <p className="font-[family-name:var(--font-hand)] text-3xl leading-none">Greetings from {chapter.city}!</p>
                <ul className="mt-3 flex flex-col gap-1 text-sm">
                  <li>
                    <b>Capital:</b> {f.capital.join(", ")}
                  </li>
                  <li>
                    <b>Languages:</b> {f.languages.join(", ")}
                  </li>
                  <li>
                    <b>Currency:</b> {f.currencies.join(", ")}
                  </li>
                  <li>
                    <b>Area:</b> {Math.round(f.area).toLocaleString("en-US")} km²
                  </li>
                </ul>
              </div>
              <div className="flex h-16 w-14 items-center justify-center border-2 border-dashed border-ink/40 text-3xl">{chapter.flag}</div>
            </div>
            <div className="flex gap-2 px-5 pb-5">
              <Link href={`/mood/${chapter.id.toLowerCase()}`} className="flex-1 rounded-full bg-ink py-2.5 text-center font-extrabold text-cream">
                {chapter.name}&apos;s mood today
              </Link>
              <button onClick={onClose} className="rounded-full bg-ink/10 px-5 font-extrabold">
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
