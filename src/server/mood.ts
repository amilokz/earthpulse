import "server-only";
import { db } from "./db";

export type Counts = [number, number, number, number, number]; // index 0 = mood 1 (sad) ... 4 = mood 5 (great)

export interface CountryCounts {
  code: string;
  c: Counts;
}

const MAX_VOTES_PER_IP_PER_DAY = 10; // aik ghar/office mein kai log ho sakte hain

const qCounts = db.prepare(`SELECT country, mood, COUNT(*) n FROM moods WHERE day = ? GROUP BY country, mood`);
const qMine = db.prepare(`SELECT mood, country FROM moods WHERE day = ? AND device = ?`);
const qIpCount = db.prepare(`SELECT COUNT(*) n FROM moods WHERE day = ? AND ip_hash = ?`);
const qInsert = db.prepare(
  `INSERT OR IGNORE INTO moods (day, device, country, mood, ip_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
);
const qKindness = db.prepare(
  `SELECT id, text, country FROM kindness WHERE status = 'live' AND device <> ? ORDER BY RANDOM() LIMIT 1`,
);

export function countsForDay(day: string): CountryCounts[] {
  const map = new Map<string, Counts>();
  for (const r of qCounts.all(day) as { country: string; mood: number; n: number }[]) {
    const c = map.get(r.country) ?? [0, 0, 0, 0, 0];
    c[r.mood - 1] = r.n;
    map.set(r.country, c);
  }
  return [...map].map(([code, c]) => ({ code, c }));
}

export function myMood(day: string, device: string) {
  return (qMine.get(day, device) as { mood: number; country: string } | undefined) ?? null;
}

export type VoteResult = { ok: true; already: boolean } | { ok: false; error: string };

export function castVote(day: string, device: string, country: string, mood: number, ip: string): VoteResult {
  if (myMood(day, device)) return { ok: true, already: true };
  const n = (qIpCount.get(day, ip) as { n: number }).n;
  if (n >= MAX_VOTES_PER_IP_PER_DAY) return { ok: false, error: "Too many votes from this network today." };
  qInsert.run(day, device, country, mood, ip, Date.now());
  return { ok: true, already: false };
}

export function randomKindness(device: string) {
  return (qKindness.get(device) as { id: number; text: string; country: string } | undefined) ?? null;
}
