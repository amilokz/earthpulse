"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import ReportButton from "@/components/ReportButton";
import { get, post } from "@/lib/api";
import { getCountry } from "@/lib/countries";

type Period = "1m" | "1y" | "5y" | "10y";
const PERIODS: { id: Period; label: string }[] = [
  { id: "1m", label: "1 month" },
  { id: "1y", label: "1 year" },
  { id: "5y", label: "5 years" },
  { id: "10y", label: "10 years" },
];

interface Opened {
  id: string;
  text: string;
  nickname: string | null;
  country: string;
  created_at: number;
  unlock_at: number;
}
interface Mine {
  id: string;
  text: string | null;
  visibility: "public" | "private";
  created_at: number;
  unlock_at: number;
}
interface Feed {
  now: number;
  opened: Opened[];
  mine: Mine[];
  stats: { locked: number; next: number | null };
}

const fmtDate = (t: number) => new Date(t).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
function timeLeft(ms: number) {
  const d = Math.ceil(ms / 864e5);
  if (d >= 360) { const y = Math.round(d / 365); return `${y} year${y === 1 ? "" : "s"}`; }
  if (d > 60) return `${Math.round(d / 30)} months`;
  return `${d} day${d === 1 ? "" : "s"}`;
}

export default function CapsuleModule() {
  const [feed, setFeed] = useState<Feed | null>(null);
  const [tab, setTab] = useState<"write" | "opened" | "mine">("write");

  const load = useCallback(() => get<Feed>("/api/capsule").then(setFeed).catch(() => {}), []);
  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <motion.p animate={{ rotate: [0, 180, 180, 360] }} transition={{ duration: 4, repeat: Infinity }} className="text-6xl">
          ⏳
        </motion.p>
        <h1 className="mt-2 text-3xl font-extrabold">Time Capsule</h1>
        <p className="text-muted">Write today. Read it in the future.</p>
      </div>

      <div className="flex rounded-full bg-white/5 p-1">
        {(
          [
            ["write", "✍️ Write"],
            ["opened", "📬 Opened"],
            ["mine", "🔒 Mine"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 rounded-full py-2 text-sm font-extrabold transition ${tab === id ? "bg-gold text-ink" : "text-muted"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          {tab === "write" && <WriteCapsule onDone={() => { load(); setTab("mine"); }} />}
          {tab === "opened" && <OpenedList feed={feed} />}
          {tab === "mine" && <MineList feed={feed} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function WriteCapsule({ onDone }: { onDone: () => void }) {
  const [text, setText] = useState("");
  const [nickname, setNickname] = useState("");
  const [period, setPeriod] = useState<Period>("1y");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sealed, setSealed] = useState(false);

  const submit = async () => {
    setSending(true);
    setError(null);
    try {
      await post("/api/capsule", { text, nickname, period, visibility });
      setSealed(true);
      setTimeout(onDone, 1800);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSending(false);
    }
  };

  if (sealed)
    return (
      <div className="card py-8 text-center">
        <motion.p initial={{ scale: 2, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} className="text-6xl">
          🔒
        </motion.p>
        <p className="mt-3 text-xl font-extrabold">Sealed!</p>
        <p className="text-muted">It opens in {PERIODS.find((p) => p.id === period)!.label}.</p>
      </div>
    );

  return (
    <div className="card flex flex-col gap-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, 500))}
        rows={5}
        placeholder="Dear future me… / Dear world in 2027…"
        className="w-full resize-none rounded-2xl border border-white/10 bg-black/30 p-3 text-base outline-none placeholder:text-white/30 focus:border-[var(--gold)]"
      />
      <div>
        <p className="mb-2 text-sm font-extrabold">Opens in</p>
        <div className="grid grid-cols-4 gap-2">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`rounded-2xl py-2 text-sm font-extrabold ${period === p.id ? "bg-gold text-ink" : "bg-white/5"}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-sm font-extrabold">Who can read it?</p>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setVisibility("public")} className={`rounded-2xl p-3 text-left ${visibility === "public" ? "bg-gold text-ink" : "bg-white/5"}`}>
            <span className="block text-xl">🌍</span>
            <span className="block text-sm font-extrabold">The world</span>
          </button>
          <button onClick={() => setVisibility("private")} className={`rounded-2xl p-3 text-left ${visibility === "private" ? "bg-gold text-ink" : "bg-white/5"}`}>
            <span className="block text-xl">🔐</span>
            <span className="block text-sm font-extrabold">Only future me</span>
          </button>
        </div>
        {visibility === "private" && (
          <p className="text-muted mt-2 text-xs">Private capsules open on this device and browser. Don&apos;t clear its cookies.</p>
        )}
      </div>
      {visibility === "public" && (
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value.slice(0, 24))}
          placeholder="Nickname (optional)"
          className="rounded-2xl border border-white/10 bg-black/30 p-3 outline-none placeholder:text-white/30"
        />
      )}
      {error && <p className="text-sm font-bold text-red-300">{error}</p>}
      <button
        onClick={submit}
        disabled={sending || text.trim().length < 10}
        className="bg-gold rounded-full py-3 text-lg font-black text-ink transition active:scale-95 disabled:opacity-40"
      >
        {sending ? "Sealing…" : "Seal capsule 🔒"}
      </button>
    </div>
  );
}

function OpenedList({ feed }: { feed: Feed | null }) {
  if (!feed) return <div className="h-40 animate-pulse rounded-3xl bg-white/5" />;
  if (feed.opened.length === 0)
    return (
      <div className="card py-8 text-center">
        <p className="text-5xl">📭</p>
        <p className="mt-3 font-extrabold">No capsules have opened yet</p>
        <p className="text-muted text-sm">
          {feed.stats.locked > 0 && feed.stats.next
            ? `${feed.stats.locked.toLocaleString()} are locked. The first one opens on ${fmtDate(feed.stats.next)}.`
            : "Be the first to write one for the world!"}
        </p>
      </div>
    );
  return (
    <ul className="flex flex-col gap-3">
      {feed.opened.map((c) => (
        <motion.li key={c.id} initial={{ opacity: 0, rotateY: 90 }} animate={{ opacity: 1, rotateY: 0 }} className="card">
          <p className="text-muted text-xs font-bold">
            Written {fmtDate(c.created_at)} · opened {fmtDate(c.unlock_at)}
          </p>
          <p className="mt-2 whitespace-pre-line text-lg leading-snug">{c.text}</p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-muted text-sm">
              — {c.nickname || "someone"} in {getCountry(c.country).flag} {getCountry(c.country).name}
            </p>
            <ReportButton type="capsule" id={c.id} />
          </div>
        </motion.li>
      ))}
    </ul>
  );
}

function MineList({ feed }: { feed: Feed | null }) {
  if (!feed) return <div className="h-40 animate-pulse rounded-3xl bg-white/5" />;
  if (feed.mine.length === 0)
    return (
      <div className="card py-8 text-center">
        <p className="text-5xl">✍️</p>
        <p className="mt-3 font-extrabold">You haven&apos;t written a capsule yet</p>
      </div>
    );
  return (
    <ul className="flex flex-col gap-3">
      {feed.mine.map((c) => {
        const open = c.text !== null;
        return (
          <li key={c.id} className="card flex items-start gap-3">
            <span className="text-3xl">{open ? "📬" : "🔒"}</span>
            <div className="flex-1">
              <p className="text-muted text-xs font-bold">
                {c.visibility === "public" ? "🌍 For the world" : "🔐 For future me"} · written {fmtDate(c.created_at)}
              </p>
              {open ? (
                <p className="mt-1 whitespace-pre-line">{c.text}</p>
              ) : (
                <p className="mt-1 font-extrabold">
                  Opens in <span className="text-gold">{timeLeft(c.unlock_at - feed.now)}</span>
                  <span className="text-muted block text-xs font-bold">on {fmtDate(c.unlock_at)}</span>
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
