"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Game, SIZE, emptyTally, type Board as BoardT, type Mood, type Pos, type Step, type Tally, type Tile } from "@/game/engine";
import { starsFor, type Level } from "@/game/levels";
import { updateProgress, useProgress } from "@/game/progress";
import { sfx } from "@/game/sound";
import Skyline from "./Skyline";

const FACE: Record<Mood, { emoji: string; bg: string }> = {
  1: { emoji: "😢", bg: "linear-gradient(160deg,#c3cbe0,#7d89a8)" },
  2: { emoji: "😔", bg: "linear-gradient(160deg,#cbb6ff,#8a6ee0)" },
  3: { emoji: "😐", bg: "linear-gradient(160deg,#a9d0ff,#4f8fe6)" },
  4: { emoji: "😊", bg: "linear-gradient(160deg,#9ff0bd,#2fbf6b)" },
  5: { emoji: "😄", bg: "linear-gradient(160deg,#ffe08a,#ffad2e)" },
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface Props {
  level: Level;
  onExit: () => void;
  onFinish: (result: { win: boolean; stars: number; score: number }) => void;
}

export default function Board({ level, onExit, onFinish }: Props) {
  const progress = useProgress();
  const [game] = useState(() => new Game(level.palette, level.seed, { clouds: level.clouds, locks: level.locks }));
  const [board, setBoard] = useState<BoardT>(() => Game.clone(game.board));
  const tally = useRef<Tally>(emptyTally());
  const [t, setT] = useState<Tally>(emptyTally); // render ke liye copy (engine ref ko mutate karta hai)
  const [moves, setMoves] = useState(level.moves);
  const [busy, setBusy] = useState(false);
  const [sel, setSel] = useState<Pos | null>(null);
  const [hint, setHint] = useState<[Pos, Pos] | null>(null);
  const [shake, setShake] = useState<Pos | null>(null);
  const [combo, setCombo] = useState<{ n: number; id: number } | null>(null);
  const [hammerMode, setHammerMode] = useState(false);
  const [status, setStatus] = useState<"play" | "win" | "lose">("play");
  const [finalScore, setFinalScore] = useState(0);
  const boardRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ pos: Pos; x: number; y: number; moved: boolean } | null>(null);
  const [cell, setCell] = useState(48);
  const sound = progress?.sound ?? true;

  // board ka size screen ke hisaab se
  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setCell(e.contentRect.width / SIZE));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const goalsDone = useCallback(() => {
    const t = tally.current;
    const g = level.goals;
    return t.moods[1] + t.moods[2] >= (g.sad ?? 0) && t.clouds >= (g.clouds ?? 0) && t.locks >= (g.locks ?? 0);
  }, [level.goals]);

  // 5 second kuch na karo to hint
  useEffect(() => {
    if (busy || status !== "play") return;
    const t = setTimeout(() => setHint(game.findMove()), 5000);
    return () => clearTimeout(t);
  }, [busy, status, board, game]);

  const play = async (steps: Step[], usedMove: boolean) => {
    setBusy(true);
    setHint(null);
    for (const s of steps) {
      setBoard(s.board);
      if (s.cleared.length) {
        if (sound) (s.cleared.some((c) => c.tile.special) ? sfx.special : () => sfx.pop(s.combo))();
        if (s.combo >= 2) setCombo({ n: s.combo, id: Math.random() });
      }
      setT(structuredClone(tally.current));
      await sleep(s.cleared.length ? 320 : 200);
    }
    const left = usedMove ? moves - 1 : moves;
    if (usedMove) setMoves(left);
    setBusy(false);
    if (goalsDone()) {
      const stars = starsFor(level, left);
      const score = tally.current.score + left * 50;
      setFinalScore(score);
      setStatus("win");
      if (sound) sfx.win();
      onFinish({ win: true, stars, score });
    } else if (left <= 0) {
      setFinalScore(tally.current.score);
      setStatus("lose");
      if (sound) sfx.lose();
      onFinish({ win: false, stars: 0, score: tally.current.score });
    }
  };

  const trySwap = (a: Pos, b: Pos) => {
    if (busy || status !== "play") return;
    setSel(null);
    if (!Game.adjacent(a, b)) return;
    if (!game.canSwap(a) || !game.canSwap(b)) {
      setShake(game.canSwap(a) ? b : a);
      if (sound) sfx.bad();
      return;
    }
    const steps = game.swap(a, b, tally.current);
    if (!steps) {
      setShake(a);
      if (sound) sfx.bad();
      return;
    }
    if (sound) sfx.swap();
    play(steps, true);
  };

  const applyHammer = (p: Pos) => {
    setHammerMode(false);
    if (!progress || progress.hammers <= 0) return;
    const steps = game.hammer(p, tally.current);
    if (!steps) return;
    updateProgress((pr) => ({ ...pr, hammers: pr.hammers - 1 }));
    play(steps, false);
  };

  const doShuffle = () => {
    if (busy || !progress || progress.shuffles <= 0) return;
    game.shuffle();
    updateProgress((pr) => ({ ...pr, shuffles: pr.shuffles - 1 }));
    setBoard(Game.clone(game.board));
    setHint(null);
  };

  // ---- touch / mouse: tap-tap ya swipe ----
  const posAt = (e: React.PointerEvent): Pos | null => {
    const rect = boardRef.current!.getBoundingClientRect();
    const c = Math.floor((e.clientX - rect.left) / cell);
    const r = Math.floor((e.clientY - rect.top) / cell);
    return r >= 0 && r < SIZE && c >= 0 && c < SIZE ? { r, c } : null;
  };
  const onDown = (e: React.PointerEvent) => {
    const p = posAt(e);
    if (!p || busy) return;
    drag.current = { pos: p, x: e.clientX, y: e.clientY, moved: false };
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.moved || hammerMode) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < cell * 0.35) return;
    d.moved = true;
    const to = Math.abs(dx) > Math.abs(dy) ? { r: d.pos.r, c: d.pos.c + Math.sign(dx) } : { r: d.pos.r + Math.sign(dy), c: d.pos.c };
    if (to.r >= 0 && to.r < SIZE && to.c >= 0 && to.c < SIZE) trySwap(d.pos, to);
  };
  const onUp = () => {
    const d = drag.current;
    drag.current = null;
    if (!d || d.moved || busy) return;
    if (hammerMode) return applyHammer(d.pos);
    if (sel && Game.adjacent(sel, d.pos)) trySwap(sel, d.pos);
    else setSel(sel && sel.r === d.pos.r && sel.c === d.pos.c ? null : d.pos);
  };

  const goals = [
    level.goals.sad ? { icon: "😢", have: t.moods[1] + t.moods[2], need: level.goals.sad, label: "sad faces cheered up" } : null,
    level.goals.clouds ? { icon: "☁️", have: t.clouds, need: level.goals.clouds, label: "clouds cleared" } : null,
    level.goals.locks ? { icon: "🔒", have: t.locks, need: level.goals.locks, label: "locks opened" } : null,
  ].filter(Boolean) as { icon: string; have: number; need: number; label: string }[];

  const tiles: { tile: Tile; r: number; c: number }[] = [];
  board.forEach((row, r) => row.forEach((tile, c) => tile && tiles.push({ tile, r, c })));
  const isHint = (r: number, c: number) => hint?.some((p) => p.r === r && p.c === c);

  return (
    <Skyline chapter={level.chapter}>
      <div className="relative z-10 flex flex-col gap-3 px-3 pb-24 pt-12 sm:px-5">
        {/* HUD */}
        <div className="flex items-stretch gap-2">
          <button onClick={onExit} aria-label="Back to map" className="rounded-2xl bg-black/30 px-3 text-xl font-black text-white backdrop-blur">
            ‹
          </button>
          <div className="flex flex-1 items-center justify-around gap-2 rounded-2xl bg-black/30 px-3 py-2 text-white backdrop-blur">
            {goals.map((g) => (
              <div key={g.icon} className="flex items-center gap-1.5" title={g.label}>
                <span className="text-2xl">{g.icon}</span>
                <span className={`font-extrabold ${g.have >= g.need ? "text-green-300" : ""}`}>
                  {g.have >= g.need ? "✓" : `${g.need - g.have}`}
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center justify-center rounded-2xl bg-black/30 px-3 py-1 text-white backdrop-blur">
            <span className={`display text-2xl font-extrabold leading-none ${moves <= 3 ? "text-red-300" : ""}`}>{moves}</span>
            <span className="text-[10px] font-bold opacity-80">moves</span>
          </div>
        </div>

        {/* Board */}
        <div className="relative mx-auto w-full max-w-[460px]">
          <div
            ref={boardRef}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={() => (drag.current = null)}
            className={`relative aspect-square w-full touch-none select-none rounded-3xl bg-[#0e0a2e]/45 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)] backdrop-blur-sm ${hammerMode ? "cursor-crosshair ring-4 ring-[var(--gold)]" : ""}`}
          >
            <AnimatePresence>
              {tiles.map(({ tile, r, c }) => {
                const selected = sel?.r === r && sel?.c === c;
                const shaking = shake?.r === r && shake?.c === c;
                return (
                  <motion.div
                    key={tile.id}
                    initial={{ x: c * cell, y: -cell, opacity: 0, scale: 0.6 }}
                    animate={{
                      x: shaking ? [c * cell - 6, c * cell + 6, c * cell - 4, c * cell] : c * cell,
                      y: r * cell,
                      opacity: 1,
                      scale: selected ? 1.12 : isHint(r, c) ? [1, 1.1, 1] : 1,
                    }}
                    exit={{ scale: 1.5, opacity: 0, transition: { duration: 0.25 } }}
                    transition={{
                      x: shaking ? { duration: 0.3 } : { type: "spring", stiffness: 500, damping: 34 },
                      y: { type: "spring", stiffness: 420, damping: 30 },
                      scale: isHint(r, c) ? { repeat: Infinity, duration: 0.9 } : { duration: 0.15 },
                    }}
                    onAnimationComplete={() => shaking && setShake(null)}
                    className="absolute left-0 top-0 p-[3px]"
                    style={{ width: cell, height: cell }}
                  >
                    <TileView tile={tile} selected={selected} />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {combo && (
              <motion.p
                key={combo.id}
                initial={{ opacity: 0, scale: 0.5, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: -10 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                onAnimationComplete={() => setTimeout(() => setCombo(null), 350)}
                className="display pointer-events-none absolute inset-x-0 top-1/3 text-center text-5xl font-extrabold text-[var(--gold)] drop-shadow-[0_4px_0_#2b2150]"
              >
                {combo.n >= 4 ? "Amazing!" : combo.n === 3 ? "Wonderful!" : "Sweet!"} ×{combo.n}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Boosters */}
        <div className="flex items-center justify-between gap-2">
          <div className="rounded-2xl bg-black/30 px-3 py-2 text-white backdrop-blur">
            <span className="text-xs font-bold opacity-80">Score </span>
            <span className="font-extrabold">{t.score.toLocaleString()}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setHammerMode((h) => !h)}
              disabled={busy || !progress?.hammers}
              className={`flex items-center gap-1.5 rounded-2xl px-3 py-2 font-extrabold backdrop-blur disabled:opacity-40 ${hammerMode ? "bg-gold text-ink" : "bg-black/30 text-white"}`}
              aria-label="Hammer: break one tile"
            >
              🔨 <span className="text-sm">{progress?.hammers ?? 0}</span>
            </button>
            <button
              onClick={doShuffle}
              disabled={busy || !progress?.shuffles}
              className="flex items-center gap-1.5 rounded-2xl bg-black/30 px-3 py-2 font-extrabold text-white backdrop-blur disabled:opacity-40"
              aria-label="Shuffle the board"
            >
              🔀 <span className="text-sm">{progress?.shuffles ?? 0}</span>
            </button>
            <button
              onClick={() => updateProgress((p) => ({ ...p, sound: !p.sound }))}
              className="rounded-2xl bg-black/30 px-3 py-2 text-white backdrop-blur"
              aria-label={sound ? "Mute" : "Unmute"}
            >
              {sound ? "🔊" : "🔇"}
            </button>
          </div>
        </div>
        {hammerMode && <p className="text-center text-sm font-bold text-white drop-shadow">Tap any tile to break it</p>}
      </div>

      <AnimatePresence>
        {status !== "play" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-20 flex items-center justify-center bg-[#0e0a2e]/70 p-6 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }} transition={{ type: "spring" }} className="card w-full max-w-xs text-center">
              {status === "win" ? (
                <>
                  <p className="text-5xl">{"⭐".repeat(starsFor(level, moves))}</p>
                  <h2 className="mt-3 text-3xl font-extrabold">{level.n ? `Level ${level.n} complete!` : "Daily challenge done!"}</h2>
                  <p className="text-muted mt-1">You cheered up {t.moods[1] + t.moods[2]} people in {level.chapter.city}.</p>
                  <p className="display mt-3 text-2xl font-extrabold text-gold">{finalScore.toLocaleString()} points</p>
                </>
              ) : (
                <>
                  <p className="text-5xl">😮‍💨</p>
                  <h2 className="mt-3 text-3xl font-extrabold">Out of moves</h2>
                  <p className="text-muted mt-1">So close. Every try makes you better at spotting combos.</p>
                </>
              )}
              <button onClick={onExit} className="mt-5 w-full rounded-full bg-gold py-3 text-lg font-extrabold text-ink">
                {status === "win" ? "Continue" : "Back to map"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Skyline>
  );
}

function TileView({ tile, selected }: { tile: Tile; selected: boolean }) {
  if (tile.special === "bomb")
    return (
      <div className="flex h-full w-full items-center justify-center rounded-[28%] bg-[conic-gradient(#ff6b8b,#ffb648,#4ade80,#60a5fa,#a78bfa,#ff6b8b)] text-[clamp(1.2rem,6vw,2rem)] shadow-[0_3px_0_rgba(0,0,0,0.25)]">
        🌈
      </div>
    );
  const f = FACE[tile.mood!];
  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden rounded-[28%] text-[clamp(1.2rem,6.4vw,2.1rem)] shadow-[0_3px_0_rgba(0,0,0,0.25),inset_0_2px_0_rgba(255,255,255,0.5)] ${selected ? "ring-4 ring-white" : ""}`}
      style={{ background: f.bg }}
    >
      <span className="drop-shadow-sm">{f.emoji}</span>
      {tile.special === "row" && <span className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 bg-white/80 shadow-[0_0_8px_white]" />}
      {tile.special === "col" && <span className="absolute inset-y-0 left-1/2 w-1.5 -translate-x-1/2 bg-white/80 shadow-[0_0_8px_white]" />}
      {tile.lock && (
        <span className="absolute inset-0 flex items-end justify-end rounded-[28%] border-[3px] border-[#6b5b3e] bg-[repeating-linear-gradient(45deg,transparent_0_6px,rgba(80,60,30,0.35)_6px_9px)] p-0.5 text-sm">
          🔒
        </span>
      )}
      {tile.cloud && <span className="absolute inset-0 flex items-center justify-center rounded-[28%] bg-white/85 text-[clamp(1.1rem,6vw,1.9rem)] backdrop-blur-[1px]">☁️</span>}
    </div>
  );
}
