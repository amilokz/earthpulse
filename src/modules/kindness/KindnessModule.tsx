"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { post } from "@/lib/api";

const MAX = 160;
const IDEAS = ["You are stronger than you think.", "Bura waqt guzar jayega. 💛", "Someone is proud of you today."];

export default function KindnessModule() {
  const [text, setText] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setState("sending");
    setError(null);
    try {
      await post("/api/kindness", { text });
      setState("sent");
      setText("");
    } catch (e) {
      setError((e as Error).message);
      setState("idle");
    }
  };

  return (
    <div className="card relative overflow-hidden">
      <AnimatePresence mode="wait">
        {state === "sent" ? (
          <motion.div key="sent" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-2 text-center">
            <motion.p animate={{ y: [0, -12, 0] }} transition={{ duration: 0.8 }} className="text-5xl">
              💌
            </motion.p>
            <p className="display mt-2 text-xl font-extrabold">Your note is on its way</p>
            <p className="text-sm text-muted">Someone who feels sad today will read it.</p>
            <button onClick={() => setState("idle")} className="mt-3 text-sm font-extrabold underline underline-offset-4">
              Write another
            </button>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-xl font-extrabold">💌 Write a note for a stranger</h2>
            <p className="text-sm text-muted">Someone who feels sad today, anywhere in the world, will get it.</p>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX))}
              placeholder={IDEAS[0]}
              rows={3}
              className="mt-3 w-full resize-none rounded-md bg-[var(--paper)] px-4 py-3 font-[family-name:var(--font-hand)] text-2xl leading-tight text-ink shadow-inner outline-none placeholder:text-ink/35"
            />
            <div className="mt-1 flex flex-wrap gap-2">
              {IDEAS.map((i) => (
                <button key={i} onClick={() => setText(i)} className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-cream/85 hover:bg-white/20">
                  {i}
                </button>
              ))}
            </div>
            {error && <p className="mt-2 rounded-xl bg-white/70 px-3 py-1.5 text-sm font-bold text-red-700">{error}</p>}
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs font-bold text-muted">{text.length}/{MAX}</span>
              <button
                onClick={submit}
                disabled={state === "sending" || text.trim().length < 8}
                className="rounded-full bg-[var(--ember)] px-5 py-2.5 font-extrabold text-ink transition active:scale-95 disabled:opacity-40"
              >
                {state === "sending" ? "Sending…" : "Send note"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
