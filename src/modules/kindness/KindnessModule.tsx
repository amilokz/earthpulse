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
    <div className="card border-pink-300/20">
      <AnimatePresence mode="wait">
        {state === "sent" ? (
          <motion.div key="sent" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-2 text-center">
            <motion.p animate={{ y: [0, -12, 0] }} transition={{ duration: 0.8 }} className="text-5xl">
              💌
            </motion.p>
            <p className="mt-2 text-lg font-extrabold">Your note is on its way</p>
            <p className="text-muted text-sm">Someone who feels sad today will read it.</p>
            <button onClick={() => setState("idle")} className="text-gold mt-3 text-sm font-bold">
              Write another
            </button>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="font-extrabold">💌 Leave a note for a stranger</p>
            <p className="text-muted text-sm">Someone sad today, anywhere in the world, will read it.</p>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX))}
              placeholder={IDEAS[0]}
              rows={3}
              className="mt-3 w-full resize-none rounded-2xl border border-white/10 bg-black/30 p-3 text-base outline-none placeholder:text-white/30 focus:border-pink-300/50"
            />
            <div className="mt-1 flex flex-wrap gap-2">
              {IDEAS.map((i) => (
                <button key={i} onClick={() => setText(i)} className="rounded-full bg-white/5 px-3 py-1 text-xs font-bold text-white/70 hover:bg-white/10">
                  {i}
                </button>
              ))}
            </div>
            {error && <p className="mt-2 text-sm font-bold text-red-300">{error}</p>}
            <div className="mt-3 flex items-center justify-between">
              <span className="text-muted text-xs">{text.length}/{MAX}</span>
              <button
                onClick={submit}
                disabled={state === "sending" || text.trim().length < 8}
                className="rounded-full bg-pink-400 px-5 py-2 font-extrabold text-black transition active:scale-95 disabled:opacity-40"
              >
                {state === "sending" ? "Sending…" : "Send 💌"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
