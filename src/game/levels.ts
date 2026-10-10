import { rng, SIZE, type Mood, type Pos } from "./engine";

export type CountryId = "PK" | "TR" | "JP";

export interface Chapter {
  id: CountryId;
  name: string;
  flag: string;
  city: string;
  timeZone: string;
  lat: number;
  lng: number;
  twist: string; // is chapter mein naya kya hai
}

export const CHAPTERS: Chapter[] = [
  { id: "PK", name: "Pakistan", flag: "🇵🇰", city: "Lahore", timeZone: "Asia/Karachi", lat: 31.55, lng: 74.34, twist: "Learn to cheer people up" },
  { id: "TR", name: "Turkey", flag: "🇹🇷", city: "Istanbul", timeZone: "Europe/Istanbul", lat: 41.01, lng: 28.98, twist: "☁️ Clouds: clear them by matching next to them" },
  { id: "JP", name: "Japan", flag: "🇯🇵", city: "Tokyo", timeZone: "Asia/Tokyo", lat: 35.68, lng: 139.69, twist: "🔒 Locks: match a locked face to free it" },
];

export interface Goals {
  sad?: number; // 😢 + 😔 jitne khush karne hain
  clouds?: number;
  locks?: number;
}

export interface Level {
  n: number; // 1..30, daily = 0
  chapter: Chapter;
  moves: number;
  palette: Mood[];
  goals: Goals;
  seed: number;
  clouds: Pos[];
  locks: Pos[];
  boss: boolean;
}

export const LEVELS_PER_CHAPTER = 10;
export const TOTAL_LEVELS = CHAPTERS.length * LEVELS_PER_CHAPTER;

/** Seed se bina dohraye cells chuno (beech ke hisse mein zyada, kinare kam) */
function spots(seed: number, count: number, avoid: Set<string> = new Set()): Pos[] {
  const r = rng(seed);
  const out: Pos[] = [];
  let guard = 0;
  while (out.length < count && guard++ < 500) {
    const p = { r: 1 + Math.floor(r() * (SIZE - 1)), c: Math.floor(r() * SIZE) };
    const k = `${p.r},${p.c}`;
    if (avoid.has(k)) continue;
    avoid.add(k);
    out.push(p);
  }
  return out;
}

export function getLevel(n: number): Level {
  const ci = Math.min(CHAPTERS.length - 1, Math.floor((n - 1) / LEVELS_PER_CHAPTER));
  const chapter = CHAPTERS[ci];
  const k = ((n - 1) % LEVELS_PER_CHAPTER) + 1; // chapter ke andar 1..10
  const boss = k === LEVELS_PER_CHAPTER;
  const palette: Mood[] = n <= 3 ? [1, 3, 4, 5] : [1, 2, 3, 4, 5];
  const seed = 1000 + n * 7919;

  const goals: Goals = { sad: Math.round(5 + n * 1.5 + (boss ? 6 : 0) - (ci === 2 ? 8 : 0)) };
  let clouds: Pos[] = [];
  let locks: Pos[] = [];
  const taken = new Set<string>();

  if (ci >= 1) {
    const count = Math.min(14, 3 + k + (boss ? 2 : 0) + (ci === 2 ? -2 : 0));
    clouds = spots(seed + 1, count, taken);
    goals.clouds = clouds.length;
  }
  if (ci >= 2) {
    locks = spots(seed + 2, Math.min(9, 2 + Math.floor(k * 0.6) + (boss ? 2 : 0)), taken);
    goals.locks = locks.length;
  }
  const moves = 16 + (ci >= 1 ? 1 : 0) + (ci >= 2 ? 4 : 0) + (boss ? 2 : 0) - Math.floor(k / 3);

  return { n, chapter, moves, palette, goals, seed, clouds, locks, boss };
}

/** Daily Challenge: aaj ki tareekh se seed, sab ke liye same board */
export function dailyLevel(day: string): Level {
  const d = Math.floor(Date.parse(day + "T00:00:00Z") / 864e5);
  const chapter = CHAPTERS[d % CHAPTERS.length];
  const seed = d * 104729;
  const taken = new Set<string>();
  const clouds = spots(seed + 1, 6, taken);
  const locks = spots(seed + 2, 4, taken);
  return {
    n: 0,
    chapter,
    moves: 25,
    palette: [1, 2, 3, 4, 5],
    goals: { sad: 14, clouds: clouds.length, locks: locks.length },
    seed,
    clouds,
    locks,
    boss: false,
  };
}

export function starsFor(level: Level, movesLeft: number): 1 | 2 | 3 {
  const frac = movesLeft / level.moves;
  return frac >= 0.4 ? 3 : frac >= 0.18 ? 2 : 1;
}
