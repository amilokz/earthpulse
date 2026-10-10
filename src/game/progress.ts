// Game progress: sirf user ke device par (localStorage). Har read/write try/catch mein.
import { useSyncExternalStore } from "react";

const KEY = "earthpulse:game:v1";
const EVT = "earthpulse:game";

export interface Progress {
  stars: Record<number, 1 | 2 | 3>;
  best: Record<number, number>; // level -> best score
  hammers: number;
  shuffles: number;
  moodBonusDay?: string; // aaj ka mood dene par mila free hammer
  daily?: { day: string; best: number; stars: number };
  postcards: string[]; // chapter ids jinka postcard mil chuka
  sound: boolean;
}

const fresh: Progress = { stars: {}, best: {}, hammers: 3, shuffles: 3, postcards: [], sound: true };

let cache: { raw: string | null; p: Progress } | null = null;

function read(): Progress {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {}
  if (cache && cache.raw === raw) return cache.p;
  let p = fresh;
  try {
    if (raw) p = { ...fresh, ...JSON.parse(raw) };
  } catch {}
  cache = { raw, p };
  return p;
}

export function updateProgress(fn: (p: Progress) => Progress) {
  const next = fn(read());
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    cache = { raw: cache?.raw ?? null, p: next }; // storage band ho tab bhi session mein chale
  }
  window.dispatchEvent(new Event(EVT));
}

export function useProgress(): Progress | null {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener(EVT, cb);
      window.addEventListener("storage", cb);
      return () => {
        window.removeEventListener(EVT, cb);
        window.removeEventListener("storage", cb);
      };
    },
    read,
    () => null,
  );
}

/** Kitne levels khule hain: pichla level jeetne par agla khulta hai */
export const unlockedUpTo = (p: Progress) => {
  let n = 1;
  while (p.stars[n]) n++;
  return n;
};
