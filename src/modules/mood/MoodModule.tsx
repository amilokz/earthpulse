"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import PulseGlobe from "@/components/PulseGlobe";
import { saveMood, todayKey, useLocalState } from "@/lib/local";
import { MOCK_COUNTRIES, MOCK_KINDNESS, MOCK_USER_COUNTRY, type CountryMood } from "@/lib/mock";
import { MOODS, happyPercent, moodByValue, totalVotes, type MoodValue } from "@/lib/moods";

export default function MoodModule() {
  const [countries, setCountries] = useState<CountryMood[]>(MOCK_COUNTRIES);
  const local = useLocalState();
  const [justVoted, setJustVoted] = useState<MoodValue | null>(null); // storage blocked ho tab bhi result dikhe
  const [noteIdx] = useState(() => Math.floor(Math.random() * MOCK_KINDNESS.length));

  // Aaj pehle vote kiya hua hai to seedha result dikhao
  const voted = local?.history[todayKey()] ?? justVoted;
  const streak = Math.max(local?.streak ?? 0, justVoted ? 1 : 0);

  const me = countries.find((c) => c.code === MOCK_USER_COUNTRY)!;
  const world = useMemo(() => {
    const sum = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as CountryMood["counts"];
    countries.forEach((c) => ([1, 2, 3, 4, 5] as MoodValue[]).forEach((k) => (sum[k] += c.counts[k])));
    return sum;
  }, [countries]);
  const happiest = useMemo(
    () => [...countries].sort((a, b) => happyPercent(b.counts) - happyPercent(a.counts)).slice(0, 5),
    [countries],
  );

  const vote = (v: MoodValue) => {
    saveMood(v);
    setJustVoted(v);
    // Optimistic: apna vote foran count mein (Step 2 mein POST /api/mood)
    setCountries((list) =>
      list.map((c) => (c.code === MOCK_USER_COUNTRY ? { ...c, counts: { ...c.counts, [v]: c.counts[v] + 1 } } : c)),
    );
  };

  const sameFeel = voted ? world[voted] : 0;
  const note = MOCK_KINDNESS[noteIdx];

  return (
    <section className="flex w-full flex-col items-center gap-6">
      <PulseGlobe countries={countries} highlight={voted ? MOCK_USER_COUNTRY : undefined} />

      <AnimatePresence mode="wait">
        {!voted ? (
          <motion.div
            key="ask"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex w-full flex-col items-center gap-6 text-center"
          >
            <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">
              How are you feeling <span className="text-gold">today?</span>
            </h1>
            <p className="text-muted -mt-3">One tap. No login. The whole world is answering.</p>
            <div className="flex w-full max-w-md justify-between gap-2">
              {MOODS.map((m, i) => (
                <motion.button
                  key={m.value}
                  onClick={() => vote(m.value)}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1, transition: { delay: 0.08 * i } }}
                  whileHover={{ scale: 1.12, y: -4 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={m.label}
                  className="flex aspect-square flex-1 flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-4xl shadow-lg backdrop-blur sm:text-5xl"
                >
                  {m.emoji}
                  <span className="text-muted mt-1 text-[11px] font-bold sm:text-xs">{m.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex w-full max-w-md flex-col gap-4"
          >
            <div className="card text-center">
              <p className="text-muted text-sm font-bold">Your dot is glowing ✨</p>
              <p className="mt-2 text-2xl font-extrabold">
                {me.flag} {me.name} is <span className="text-gold">{happyPercent(me.counts)}% happy</span> today
              </p>
              <MoodBar counts={me.counts} />
              <p className="text-muted mt-3 text-sm">
                You and <b className="text-white">{sameFeel.toLocaleString()}</b> people feel{" "}
                {moodByValue(voted).emoji} {moodByValue(voted).label.toLowerCase()} today. You&apos;re not alone.
              </p>
            </div>

            {voted <= 2 && (
              <motion.div
                initial={{ opacity: 0, rotateX: -60 }}
                animate={{ opacity: 1, rotateX: 0, transition: { delay: 0.4 } }}
                className="card border-pink-300/30 bg-pink-400/10"
              >
                <p className="text-sm font-bold text-pink-200">💌 A note from a stranger</p>
                <p className="mt-2 text-lg leading-snug">“{note.text}”</p>
                <p className="text-muted mt-2 text-sm">— a friend in {note.flag} {note.from}</p>
              </motion.div>
            )}

            <div className="card">
              <p className="mb-3 font-extrabold">🌍 Happiest countries right now</p>
              <ol className="flex flex-col gap-2">
                {happiest.map((c, i) => (
                  <li key={c.code} className="flex items-center gap-3">
                    <span className="text-muted w-4 text-sm font-bold">{i + 1}</span>
                    <span className="text-xl">{c.flag}</span>
                    <span className="flex-1 font-bold">{c.name}</span>
                    <span className="text-gold font-extrabold">{happyPercent(c.counts)}%</span>
                  </li>
                ))}
              </ol>
              <p className="text-muted mt-3 text-xs">
                {totalVotes(world).toLocaleString()} moods shared today across the world
              </p>
            </div>

            <div className="card flex items-center justify-between">
              <div>
                <p className="font-extrabold">🔥 Day {streak} streak</p>
                <p className="text-muted text-sm">Come back tomorrow, the world resets at midnight UTC 🌙</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function MoodBar({ counts }: { counts: CountryMood["counts"] }) {
  const t = totalVotes(counts);
  return (
    <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-white/10">
      {MOODS.map((m) => (
        <motion.div
          key={m.value}
          initial={{ width: 0 }}
          animate={{ width: `${(counts[m.value] / t) * 100}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ background: m.color }}
          title={`${m.emoji} ${m.label}`}
        />
      ))}
    </div>
  );
}
