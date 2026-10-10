import "server-only";
import { db } from "./db";
import { countsForDay, type Counts } from "./mood";

export interface WorldToday {
  total: number;
  countries: number;
  counts: Counts; // index 0 = sad ... 4 = great
  byCountry: { code: string; c: Counts }[];
}

export function worldToday(day: string): WorldToday {
  const byCountry = countsForDay(day);
  const counts: Counts = [0, 0, 0, 0, 0];
  for (const r of byCountry) r.c.forEach((n, i) => (counts[i] += n));
  return {
    total: counts.reduce((a, b) => a + b, 0),
    countries: byCountry.filter((r) => r.code !== "XX").length,
    counts,
    byCountry,
  };
}

/** Taaza moods: sirf country + mood + waqt (device kabhi nahi) */
export function recentActivity(day: string, limit = 10) {
  return db
    .prepare(`SELECT country, mood, created_at FROM moods WHERE day = ? ORDER BY created_at DESC LIMIT ?`)
    .all(day, limit) as { country: string; mood: number; created_at: number }[];
}

export function latestKindness(limit = 6, offset = 0) {
  return db
    .prepare(`SELECT id, text, country, created_at FROM kindness WHERE status = 'live' ORDER BY created_at DESC LIMIT ? OFFSET ?`)
    .all(limit, offset) as { id: number; text: string; country: string; created_at: number }[];
}

export function kindnessCount() {
  return (db.prepare(`SELECT COUNT(*) n FROM kindness WHERE status = 'live'`).get() as { n: number }).n;
}

export function storyPreview(day: string) {
  const last = db
    .prepare(`SELECT text, nickname, country FROM story_lines WHERE status = 'winner' ORDER BY day DESC, id DESC LIMIT 2`)
    .all() as { text: string; nickname: string | null; country: string }[];
  const chapter = (db.prepare(`SELECT COUNT(*) n FROM story_lines WHERE status = 'winner'`).get() as { n: number }).n;
  const today = (db.prepare(`SELECT COUNT(*) n FROM story_lines WHERE day = ? AND status = 'candidate'`).get(day) as { n: number }).n;
  return { lines: last.reverse(), chapter, candidatesToday: today };
}

export function capsuleStats() {
  const now = Date.now();
  return db
    .prepare(
      `SELECT
         SUM(CASE WHEN unlock_at > ? THEN 1 ELSE 0 END) locked,
         SUM(CASE WHEN unlock_at <= ? AND visibility = 'public' AND status = 'live' THEN 1 ELSE 0 END) opened,
         MIN(CASE WHEN unlock_at > ? THEN unlock_at END) next
       FROM capsules`,
    )
    .get(now, now, now) as { locked: number | null; opened: number | null; next: number | null };
}

/** Kisi country ke pichle `days` din (UTC) */
export function countryHistory(code: string, today: string, days = 14) {
  const start = new Date(today + "T00:00:00Z");
  start.setUTCDate(start.getUTCDate() - (days - 1));
  const from = start.toISOString().slice(0, 10);
  const rows = db
    .prepare(`SELECT day, mood, COUNT(*) n FROM moods WHERE country = ? AND day >= ? GROUP BY day, mood`)
    .all(code, from) as { day: string; mood: number; n: number }[];
  const out: { day: string; c: Counts }[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    out.push({ day: d.toISOString().slice(0, 10), c: [0, 0, 0, 0, 0] });
  }
  const idx = new Map(out.map((o, i) => [o.day, i]));
  for (const r of rows) {
    const i = idx.get(r.day);
    if (i !== undefined) out[i].c[r.mood - 1] = r.n;
  }
  return out;
}
