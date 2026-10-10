// Client-side personal data (localStorage). Har read/write try/catch mein,
// private mode ya blocked storage mein site phir bhi chalni chahiye.
import { useSyncExternalStore } from "react";
import type { MoodValue } from "./moods";

const KEY = "earthpulse:v1";

export interface LocalState {
  history: Record<string, MoodValue>; // "2026-10-09" -> mood
  streak: number;
  lastDay?: string;
}

const empty: LocalState = { history: {}, streak: 0 };

export const todayKey = (d = new Date()) => d.toISOString().slice(0, 10); // UTC din (server reset bhi UTC)

export function loadState(): LocalState {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...empty, ...JSON.parse(raw) } : empty;
  } catch {
    return empty;
  }
}

export function saveMood(mood: MoodValue): LocalState {
  const s = loadState();
  const today = todayKey();
  if (s.history[today]) return s; // 1 vote per din

  const y = new Date();
  y.setUTCDate(y.getUTCDate() - 1);
  const streak = s.lastDay === todayKey(y) ? s.streak + 1 : 1;

  const next: LocalState = { history: { ...s.history, [today]: mood }, streak, lastDay: today };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage blocked — vote phir bhi screen par dikhega */
  }
  notifyChange();
  return next;
}

// --- React hook (useSyncExternalStore: hydration-safe, effect mein setState nahi) ---

const EVT = "earthpulse:change";
let cache: { raw: string | null; state: LocalState } | null = null;

function snapshot(): LocalState {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {}
  if (!cache || cache.raw !== raw) cache = { raw, state: loadState() };
  return cache.state;
}

function subscribe(cb: () => void) {
  window.addEventListener(EVT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function useLocalState(): LocalState | null {
  return useSyncExternalStore(subscribe, snapshot, () => null);
}

export function notifyChange() {
  window.dispatchEvent(new Event(EVT));
}
