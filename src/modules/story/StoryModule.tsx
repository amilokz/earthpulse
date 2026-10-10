"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import ReportButton from "@/components/ReportButton";
import { get, post } from "@/lib/api";
import { getCountry } from "@/lib/countries";

interface Line {
  id: number;
  day: string;
  text: string;
  nickname: string | null;
  country: string;
}
interface Candidate {
  id: number;
  text: string;
  nickname: string | null;
  country: string;
  votes: number | null;
  mine: boolean;
}
interface Story {
  day: string;
  lines: Line[];
  candidates: Candidate[];
  myVote: number | null;
  myLine: number | null;
}

function useCountdown() {
  const [left, setLeft] = useState("");
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
      const s = Math.max(0, Math.floor((end - now.getTime()) / 1000));
      setLeft(`${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`);
    };
    tick();
    const t = setInterval(tick, 30_000);
    return () => clearInterval(t);
  }, []);
  return left;
}

export default function StoryModule() {
  const [story, setStory] = useState<Story | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const left = useCountdown();

  const load = useCallback(() => get<Story>("/api/story").then(setStory).catch(() => setError("Couldn't load the story.")), []);
  useEffect(() => {
    load();
  }, [load]);

  const act = async (body: object) => {
    setError(null);
    try {
      setStory(await post<Story>("/api/story", body));
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    }
  };

  if (!story) return <div className="h-64 animate-pulse rounded-3xl bg-white/5" />;

  const lines = showAll ? story.lines : story.lines.slice(-4);
  const hidden = story.lines.length - lines.length;
  const totalVotes = story.candidates.reduce((s, c) => s + (c.votes ?? 0), 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <p className="text-6xl">📖</p>
        <h1 className="mt-2 text-3xl font-extrabold">The World&apos;s Story</h1>
        <p className="text-muted">
          One story. The whole world. One line a day. <b className="text-white">Chapter {story.lines.length}</b>
        </p>
      </div>

      <div className="card font-serif">
        {hidden > 0 && (
          <button onClick={() => setShowAll(true)} className="text-gold mb-3 text-sm font-bold">
            ↑ Read from the beginning ({hidden} more lines)
          </button>
        )}
        <div className="flex flex-col gap-3 text-lg leading-relaxed">
          {lines.map((l, i) => (
            <motion.p key={l.id} initial={{ opacity: 0 }} animate={{ opacity: i >= lines.length - 2 ? 1 : 0.65 }}>
              {l.text}{" "}
              <span className="font-sans text-xs text-white/40">
                {getCountry(l.country).flag} {l.nickname ?? ""}
              </span>
            </motion.p>
          ))}
          <p className="text-gold animate-pulse">…</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold">What happens next?</h2>
        <span className="text-muted text-sm font-bold">⏰ {left} left</span>
      </div>

      {error && <p className="rounded-2xl bg-red-500/15 px-4 py-2 text-sm font-bold text-red-200">{error}</p>}

      {story.candidates.length === 0 ? (
        <p className="card text-muted text-center">No lines yet today. Write the first one! ✍️</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {story.candidates.map((c) => {
            const picked = story.myVote === c.id;
            const pct = c.votes !== null && totalVotes ? Math.round((c.votes / totalVotes) * 100) : null;
            return (
              <li key={c.id}>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  disabled={story.myVote !== null || c.mine}
                  onClick={() => act({ action: "vote", id: c.id })}
                  className={`card relative w-full overflow-hidden text-left transition ${picked ? "border-[var(--gold)]" : ""} ${
                    story.myVote === null && !c.mine ? "hover:bg-white/10" : ""
                  }`}
                >
                  {pct !== null && (
                    <motion.span
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      className="absolute inset-y-0 left-0 bg-[var(--gold)]/15"
                    />
                  )}
                  <span className="relative block font-serif text-lg">{c.text}</span>
                  <span className="relative mt-1 flex items-center justify-between text-xs">
                    <span className="text-muted">
                      {getCountry(c.country).flag} {c.nickname ?? "anonymous"} {c.mine && "· your line"}
                    </span>
                    <span className="text-gold font-extrabold">{picked ? "✓ your vote" : pct !== null ? `${pct}%` : c.mine ? "" : story.myVote !== null ? "" : "Tap to vote"}</span>
                  </span>
                </motion.button>
                {!c.mine && (
                  <div className="mt-1 text-right">
                    <ReportButton type="story" id={c.id} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {story.myLine === null ? <WriteLine onSubmit={(text, nickname) => act({ action: "write", text, nickname })} /> : (
        <p className="card text-center font-bold">✍️ Your line is in today&apos;s vote. If it wins, it joins the story forever!</p>
      )}
    </div>
  );
}

function WriteLine({ onSubmit }: { onSubmit: (text: string, nickname: string) => Promise<boolean> }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [nickname, setNickname] = useState("");
  const [sending, setSending] = useState(false);

  return (
    <AnimatePresence mode="wait">
      {!open ? (
        <motion.button key="btn" onClick={() => setOpen(true)} className="bg-gold rounded-full py-3 text-lg font-black text-black active:scale-95">
          ✍️ Write the next line
        </motion.button>
      ) : (
        <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card flex flex-col gap-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 140))}
            rows={3}
            autoFocus
            placeholder="And then…"
            className="w-full resize-none rounded-2xl border border-white/10 bg-black/30 p-3 font-serif text-lg outline-none placeholder:text-white/30 focus:border-[var(--gold)]"
          />
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value.slice(0, 24))}
            placeholder="Nickname for credit (optional)"
            className="rounded-2xl border border-white/10 bg-black/30 p-3 outline-none placeholder:text-white/30"
          />
          <div className="flex items-center justify-between">
            <span className="text-muted text-xs">{text.length}/140 · one line per day</span>
            <button
              disabled={sending || text.trim().length < 10}
              onClick={async () => {
                setSending(true);
                if (await onSubmit(text, nickname)) setOpen(false);
                setSending(false);
              }}
              className="bg-gold rounded-full px-5 py-2 font-black text-black disabled:opacity-40"
            >
              {sending ? "Adding…" : "Add to vote"}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
