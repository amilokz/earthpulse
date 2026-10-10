import "server-only";
import { db } from "./db";

const OPENING =
  "On the first morning, every person on Earth woke up to find the same small, glowing seed on their windowsill.";

const qWinners = db.prepare(`SELECT id, day, text, nickname, country FROM story_lines WHERE status = 'winner' ORDER BY day ASC, id ASC`);
const qCandidates = db.prepare(
  `SELECT id, text, nickname, country, votes, device FROM story_lines WHERE day = ? AND status = 'candidate' ORDER BY votes DESC, id ASC LIMIT 50`,
);
const qPendingDays = db.prepare(
  `SELECT DISTINCT day FROM story_lines WHERE status = 'candidate' AND day < ?`,
);
const qMyVote = db.prepare(`SELECT line_id FROM story_votes WHERE day = ? AND device = ?`);
const qMyLine = db.prepare(`SELECT id FROM story_lines WHERE day = ? AND device = ?`);

function seed() {
  const has = db.prepare(`SELECT 1 FROM story_lines WHERE status = 'winner' LIMIT 1`).get();
  if (!has) {
    db.prepare(
      `INSERT INTO story_lines (day, text, nickname, country, device, status, created_at) VALUES ('2026-10-01', ?, 'EarthPulse', 'XX', 'system', 'winner', ?)`,
    ).run(OPENING, Date.now());
  }
}

/**
 * Cron ki zaroorat nahi: jab bhi koi story khole, pichle dinon ke winner
 * khud tay ho jate hain (sab se zyada votes, barabar ho to pehle likhi line).
 */
const finalize = db.transaction((today: string) => {
  for (const { day } of qPendingDays.all(today) as { day: string }[]) {
    const best = db
      .prepare(`SELECT id FROM story_lines WHERE day = ? AND status = 'candidate' ORDER BY votes DESC, id ASC LIMIT 1`)
      .get(day) as { id: number } | undefined;
    if (!best) continue;
    db.prepare(`UPDATE story_lines SET status = 'winner' WHERE id = ?`).run(best.id);
    db.prepare(`UPDATE story_lines SET status = 'lost' WHERE day = ? AND status = 'candidate'`).run(day);
  }
});

export function getStory(today: string, device: string) {
  seed();
  finalize(today);
  const myVote = (qMyVote.get(today, device) as { line_id: number } | undefined)?.line_id ?? null;
  const myLine = (qMyLine.get(today, device) as { id: number } | undefined)?.id ?? null;
  const showVotes = myVote !== null || myLine !== null; // vote se pehle counts chhupe (bias na ho)
  const candidates = (qCandidates.all(today) as { id: number; text: string; nickname: string | null; country: string; votes: number; device: string }[]).map(
    ({ device: d, votes, ...c }) => ({ ...c, votes: showVotes ? votes : null, mine: d === device }),
  );
  return { day: today, lines: qWinners.all(), candidates, myVote, myLine };
}

export type StoryResult = { ok: true } | { ok: false; error: string };

export function submitLine(today: string, device: string, country: string, text: string, nickname: string | null): StoryResult {
  finalize(today);
  if (qMyLine.get(today, device)) return { ok: false, error: "You've already written today's line. Come back tomorrow ✍️" };
  db.prepare(
    `INSERT INTO story_lines (day, text, nickname, country, device, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(today, text, nickname, country, device, Date.now());
  return { ok: true };
}

export const voteLine = db.transaction((today: string, device: string, lineId: number): StoryResult => {
  const line = db.prepare(`SELECT device FROM story_lines WHERE id = ? AND day = ? AND status = 'candidate'`).get(lineId, today) as
    | { device: string }
    | undefined;
  if (!line) return { ok: false, error: "That line isn't in today's vote." };
  if (line.device === device) return { ok: false, error: "You can't vote for your own line 🙂" };
  const r = db.prepare(`INSERT OR IGNORE INTO story_votes (day, device, line_id) VALUES (?, ?, ?)`).run(today, device, lineId);
  if (r.changes === 0) return { ok: false, error: "You've already voted today." };
  db.prepare(`UPDATE story_lines SET votes = votes + 1 WHERE id = ?`).run(lineId);
  return { ok: true };
});
