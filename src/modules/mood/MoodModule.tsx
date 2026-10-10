"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import PulseGlobe from "@/components/PulseGlobe";
import ReportButton from "@/components/ReportButton";
import ShareButton from "@/components/ShareButton";
import { fetchToday, sendMood, type CountryMood, type KindnessNote } from "@/lib/api";
import { getCountry } from "@/lib/countries";
import { saveMood, todayKey, useLocalState } from "@/lib/local";
import { MOODS, dominantMood, happyPercent, moodByValue, totalVotes, type MoodCounts, type MoodValue } from "@/lib/moods";

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

  const worldTotal = totalVotes(world);
  // Smile ki shakal: kinare upar, beech neeche
  const ARC = [0, 16, 24, 16, 0];

  return (
    <section className="flex w-full flex-col items-center">
      <div className="relative w-full">
        <div className="heartbeat pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,#ff9a5a55_0%,#ff6b8b22_45%,transparent_70%)] blur-2xl" />
        <div className="relative mx-auto flex justify-center">
          <PulseGlobe countries={countries} highlight={voted ? myCountry : undefined} />
        </div>
      </div>

      {error && <p className="mb-4 rounded-2xl bg-red-500/20 px-4 py-2 text-sm font-bold text-red-100">{error}</p>}

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="load" exit={{ opacity: 0 }} className="-mt-10 h-48 w-full max-w-md animate-pulse rounded-[2rem] bg-white/5" />
        ) : !voted ? (
          <motion.div
            key="ask"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="relative z-10 -mt-14 flex w-full flex-col items-center text-center"
          >
            <h1 className="max-w-[12ch] text-[2.6rem] font-extrabold leading-[0.95] sm:text-6xl">How do you feel today?</h1>
            <p className="text-muted mt-3 max-w-[30ch] text-base">Tap one. Your dot joins the world&apos;s live mood.</p>

            <div className="mt-6 flex w-full max-w-md items-start justify-between px-1">
              {MOODS.map((m, i) => (
                <motion.button
                  key={m.value}
                  onClick={() => vote(m.value)}
                  disabled={sending}
                  initial={{ opacity: 0, y: ARC[i] + 30 }}
                  animate={{ opacity: 1, y: ARC[i], transition: { delay: 0.25 + 0.07 * i, type: "spring", stiffness: 260, damping: 18 } }}
                  whileHover={{ y: ARC[i] - 8, scale: 1.08 }}
                  whileTap={{ scale: 0.88 }}
                  aria-label={m.label}
                  className="group flex w-[18%] flex-col items-center gap-1.5 disabled:opacity-50"
                >
                  <span
                    className="flex aspect-square w-full items-center justify-center rounded-full text-[2.4rem] sm:text-5xl"
                    style={{ background: `radial-gradient(circle at 50% 35%, ${m.color}55, ${m.color}14 70%)`, boxShadow: `0 0 0 2px ${m.color}44, 0 10px 30px -10px ${m.color}` }}
                  >
                    {m.emoji}
                  </span>
                  <span className="text-xs font-extrabold text-cream/80 group-hover:text-cream">{m.label}</span>
                </motion.button>
              ))}
            </div>

            <p className="text-muted mt-10 text-sm">
              {worldTotal > 0 ? `${worldTotal.toLocaleString()} people have shared their mood today` : "Nobody has shared yet today. Be the first dot on the map."}
            </p>
          </motion.div>
        ) : (
          <motion.div key="result" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 -mt-10 flex w-full max-w-md flex-col gap-5">
            <div className="text-center">
              <p className="text-muted text-sm font-bold">
                You felt {moodByValue(voted).emoji} {moodByValue(voted).label.toLowerCase()} today
              </p>
              <h1 className="mt-2 text-[2.3rem] font-extrabold leading-[1] sm:text-5xl">
                {myTotal >= MIN_VOTES_FOR_RANKING ? (
                  <>
                    {me.flag} {me.name} feels mostly {dominantMood(myCounts).label.toLowerCase()} today
                  </>
                ) : (
                  <>You&apos;re one of the first from {me.flag} {me.name}</>
                )}
              </h1>
              <Spectrum counts={myCounts} />
              {myTotal >= MIN_VOTES_FOR_RANKING && (
                <p className="mt-1 text-sm font-bold text-cream/85">
                  {happyPercent(myCounts)}% happy · {myTotal.toLocaleString()} moods from {me.name} today
                </p>
              )}
              <p className="text-muted mt-3 text-sm">
                {sameFeel > 0
                  ? `${sameFeel.toLocaleString()} other people feel ${moodByValue(voted).label.toLowerCase()} today too. You're not alone.`
                  : "Your friends haven't added their dots yet. Send them EarthPulse."}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <ShareButton
                country={me.code}
                countryName={me.name}
                happy={myTotal >= MIN_VOTES_FOR_RANKING && me.code !== "XX" ? happyPercent(myCounts) : null}
                mood={voted}
                moodEmoji={moodByValue(voted).emoji}
                streak={streak}
              />
              <p className="text-center text-sm font-bold text-cream/80">
                🔥 Day {streak} · come back tomorrow, the world resets at midnight UTC
              </p>
            </div>

            {voted <= 2 && (
              <motion.figure
                initial={{ opacity: 0, rotate: 4, y: 20 }}
                animate={{ opacity: 1, rotate: -1.5, y: 0, transition: { delay: 0.5, type: "spring" } }}
                className="relative mx-2 rounded-md bg-[var(--paper)] px-6 pb-5 pt-7 text-ink shadow-[0_24px_50px_-20px_rgba(0,0,0,0.7)]"
              >
                <span className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 rotate-2 bg-[#ffd98a]/80" />
                <p className="text-sm font-extrabold text-ink/60">A note for you</p>
                <blockquote className="mt-1 font-[family-name:var(--font-hand)] text-[1.9rem] leading-[1.1]">{note?.text ?? starter}</blockquote>
                <figcaption className="mt-3 flex items-center justify-between gap-2 text-sm text-ink/60">
                  <span>{note ? `from a stranger in ${getCountry(note.country).flag} ${getCountry(note.country).name}` : "from the EarthPulse team"}</span>
                  {note && <ReportButton type="kindness" id={note.id} />}
                </figcaption>
              </motion.figure>
            )}

            {happiest.length > 0 && (
              <div>
                <h2 className="mb-2 text-lg font-extrabold">Happiest places right now</h2>
                <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
                  {happiest.map((c) => (
                    <span key={c.code} className="flex shrink-0 items-center gap-2 rounded-full bg-white/10 py-1.5 pl-2 pr-3.5">
                      <span className="text-2xl">{c.flag}</span>
                      <span className="text-sm font-bold">{c.name}</span>
                      <span className="text-sm font-extrabold text-gold">{happyPercent(c.counts)}%</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

const emptyCounts = (): MoodCounts => ({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

// Mood spectrum ribbon: har rang aik mood, chaurai = kitne log
function Spectrum({ counts }: { counts: MoodCounts }) {
  const t = totalVotes(counts);
  if (!t) return null;
  return (
    <div className="mt-5">
      <div className="flex h-4 w-full overflow-hidden rounded-full bg-white/10">
        {MOODS.map((m) => (
          <motion.div
            key={m.value}
            initial={{ width: 0 }}
            animate={{ width: `${(counts[m.value] / t) * 100}%` }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            style={{ background: m.color }}
            title={`${m.emoji} ${m.label}: ${counts[m.value]}`}
          />
        ))}
      </div>
      <div className="text-muted mt-1.5 flex justify-between text-lg">
        {MOODS.map((m) => (
          <span key={m.value} className={counts[m.value] ? "" : "opacity-30"}>
            {m.emoji}
          </span>
        ))}
      </div>
    </div>
  );
}
