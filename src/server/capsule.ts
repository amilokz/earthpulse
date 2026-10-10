import "server-only";
import { randomBytes } from "node:crypto";
import { db } from "./db";

export const PERIODS = {
  "1m": { label: "1 month", ms: 30 * 864e5 },
  "1y": { label: "1 year", ms: 365 * 864e5 },
  "5y": { label: "5 years", ms: 5 * 365 * 864e5 },
  "10y": { label: "10 years", ms: 10 * 365 * 864e5 },
} as const;
export type Period = keyof typeof PERIODS;
export const isPeriod = (p: unknown): p is Period => typeof p === "string" && p in PERIODS;

const qInsert = db.prepare(
  `INSERT INTO capsules (id, text, nickname, country, device, day, visibility, created_at, unlock_at)
   VALUES (@id, @text, @nickname, @country, @device, @day, @visibility, @created_at, @unlock_at)`,
);
const qOpened = db.prepare(
  `SELECT id, text, nickname, country, created_at, unlock_at FROM capsules
   WHERE visibility = 'public' AND status = 'live' AND unlock_at <= ? ORDER BY unlock_at DESC LIMIT 30`,
);
const qMine = db.prepare(
  `SELECT id, text, visibility, created_at, unlock_at FROM capsules WHERE device = ? ORDER BY unlock_at ASC LIMIT 50`,
);
const qStats = db.prepare(
  `SELECT COUNT(*) locked, MIN(unlock_at) next FROM capsules WHERE visibility = 'public' AND status = 'live' AND unlock_at > ?`,
);

export function createCapsule(c: {
  device: string;
  country: string;
  day: string;
  text: string;
  nickname: string | null;
  visibility: "public" | "private";
  period: Period;
}) {
  const now = Date.now();
  const id = randomBytes(8).toString("base64url");
  const { period, ...row } = c;
  qInsert.run({ ...row, id, created_at: now, unlock_at: now + PERIODS[period].ms });
  return { id, unlock_at: now + PERIODS[c.period].ms };
}

export function capsuleFeed(device: string) {
  const now = Date.now();
  const mine = (qMine.all(device) as { id: string; text: string; visibility: string; created_at: number; unlock_at: number }[]).map(
    // Unlock se pehle text kabhi browser tak nahi jata
    (c) => ({ ...c, text: c.unlock_at <= now ? c.text : null }),
  );
  const stats = qStats.get(now) as { locked: number; next: number | null };
  return { now, opened: qOpened.all(now), mine, stats };
}
