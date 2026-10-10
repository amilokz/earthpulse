"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import PulseGlobe from "@/components/PulseGlobe";
import ReportButton from "@/components/ReportButton";
import ShareButton from "@/components/ShareButton";
import { fetchToday, sendMood, type CountryMood, type KindnessNote } from "@/lib/api";
import { getCountry } from "@/lib/countries";
import { saveMood, todayKey, useLocalState } from "@/lib/local";
import { MOODS, happyPercent, moodByValue, totalVotes, type MoodCounts, type MoodValue } from "@/lib/moods";

const MIN_VOTES_FOR_RANKING = 3; // 1 vote se "100% happy" na dikhe

// Jab tak users ke apne notes na hon, team ke starter notes (honestly labelled)
const STARTER_NOTES = [
  "Whoever is reading this: hard days pass. You've survived every one so far. 🌱",
  "Aaj ka din bura ho sakta hai, lekin tumhari zindagi buri nahi hai. 💛",
  "Drink some water, take a slow breath. You matter more than you know.",
];

interface Props {
  onVoted?: (mood: MoodValue) => void;
  children?: React.ReactNode; // vote ke baad dikhne wale doosre cards
}

export default function MoodModule({ onVoted, children }: Props) {
  const local = useLocalState();
  const [countries, setCountries] = useState<CountryMood[]>([]);
  const [myCountry, setMyCountry] = useState("XX");
  const [serverMood, setServerMood] = useState<MoodValue | null>(null);
  const [note, setNote] = useState<KindnessNote | null>(null);
  const [starter] = useState(() => STARTER_NOTES[Math.floor(Math.random() * STARTER_NOTES.length)]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetchToday()
      .then((d) => {
        if (!alive) return;
        setCountries(d.countries);
        setMyCountry(d.me.country);
        setServerMood(d.me.mood);
        if (d.me.mood) saveMood(d.me.mood); // dusre browser tab / cleared storage sync
      })
      .catch(() => alive && setError("Couldn't reach EarthPulse. Check your internet."))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const voted: MoodValue | null = serverMood ?? local?.history[todayKey()] ?? null;
  const streak = Math.max(local?.streak ?? 0, voted ? 1 : 0);

  const vote = async (v: MoodValue) => {
    if (sending) return;
    setSending(true);
    setError(null);
    try {
      const d = await sendMood(v);
      setCountries(d.countries);
      setMyCountry(d.me.country);
      setServerMood(d.me.mood);
      setNote(d.note);
      saveMood(d.me.mood ?? v);
      onVoted?.(v);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSending(false);
    }
  };

  const me = getCountry(myCountry);
  const myCounts = countries.find((c) => c.code === myCountry)?.counts ?? emptyCounts();
  const world = useMemo(() => {
    const sum = emptyCounts();
    countries.forEach((c) => MOODS.forEach((m) => (sum[m.value] += c.counts[m.value])));
    return sum;
  }, [countries]);
  const happiest = useMemo(
    () =>
      countries
        .filter((c) => c.code !== "XX" && totalVotes(c.counts) >= MIN_VOTES_FOR_RANKING)
        .sort((a, b) => happyPercent(b.counts) - happyPercent(a.counts))
        .slice(0, 5),
    [countries],
  );

  const sameFeel = voted ? Math.max(0, world[voted] - 1) : 0;
  const myTotal = totalVotes(myCounts);

  return (
    <section className="flex w-full flex-col items-center gap-6">
      <PulseGlobe countries={countries} highlight={voted ? myCountry : undefined} />

      {error && <p className="rounded-2xl bg-red-500/15 px-4 py-2 text-sm font-bold text-red-200">{error}</p>}

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="load" exit={{ opacity: 0 }} className="h-40 w-full max-w-md animate-pulse rounded-3xl bg-white/5" />
        ) : !voted ? (
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
                  disabled={sending}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1, transition: { delay: 0.08 * i } }}
                  whileHover={{ scale: 1.12, y: -4 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={m.label}
                  className="flex aspect-square flex-1 flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-4xl shadow-lg backdrop-blur disabled:opacity-50 sm:text-5xl"
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
              <p className="text-muted text-sm font-bold">
                You felt {moodByValue(voted).emoji} {moodByValue(voted).label.toLowerCase()} today · your dot is glowing ✨
              </p>
              {myTotal >= MIN_VOTES_FOR_RANKING ? (
                <p className="mt-2 text-2xl font-extrabold">
                  {me.flag} {me.name} is <span className="text-gold">{happyPercent(myCounts)}% happy</span> today
                </p>
              ) : (
                <p className="mt-2 text-2xl font-extrabold">
                  You&apos;re one of the first from {me.flag} <span className="text-gold">{me.name}</span> today!
                </p>
              )}
              <MoodBar counts={myCounts} />
              <p className="text-muted mt-3 text-sm">
                {sameFeel > 0 ? (
                  <>
                    You and <b className="text-white">{sameFeel.toLocaleString()}</b> others feel{" "}
                    {moodByValue(voted).label.toLowerCase()} today. You&apos;re not alone.
                  </>
                ) : (
                  <>Share EarthPulse so your friends can add their dots too 🌍</>
                )}
              </p>
              <div className="mt-4">
                <ShareButton
                  country={me.code}
                  countryName={me.name}
                  happy={myTotal >= MIN_VOTES_FOR_RANKING && me.code !== "XX" ? happyPercent(myCounts) : null}
                  mood={voted}
                  moodEmoji={moodByValue(voted).emoji}
                  streak={streak}
                />
              </div>
            </div>

            {voted <= 2 && (
              <motion.div
                initial={{ opacity: 0, rotateX: -60 }}
                animate={{ opacity: 1, rotateX: 0, transition: { delay: 0.4 } }}
                className="card border-pink-300/30 bg-pink-400/10"
              >
                <p className="text-sm font-bold text-pink-200">💌 A note for you</p>
                <p className="mt-2 text-lg leading-snug">“{note?.text ?? starter}”</p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <p className="text-muted text-sm">
                    {note ? <>— a stranger in {getCountry(note.country).flag} {getCountry(note.country).name}</> : "— the EarthPulse team"}
                  </p>
                  {note && <ReportButton type="kindness" id={note.id} />}
                </div>
              </motion.div>
            )}

            {children}

            {happiest.length > 0 && (
              <div className="card">
                <p className="mb-3 font-extrabold">🌍 Happiest countries today</p>
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
              </div>
            )}

            <div className="card">
              <p className="font-extrabold">🔥 Day {streak} streak</p>
              <p className="text-muted text-sm">
                {totalVotes(world).toLocaleString()} moods shared today. The world resets at midnight UTC 🌙
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

const emptyCounts = (): MoodCounts => ({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

function MoodBar({ counts }: { counts: MoodCounts }) {
  const t = totalVotes(counts);
  if (!t) return null;
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
