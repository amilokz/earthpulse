import "server-only";
import { db } from "./db";
import { REPORT_HIDE_AT } from "./moderation";

// Kindness, capsule, story — teeno ke liye common report / admin logic
export const CONTENT_TABLES = { kindness: "kindness", capsule: "capsules", story: "story_lines" } as const;
export type ContentType = keyof typeof CONTENT_TABLES;

export const isContentType = (t: unknown): t is ContentType => typeof t === "string" && t in CONTENT_TABLES;

const qReport = db.prepare(`INSERT OR IGNORE INTO reports (type, target_id, device, created_at) VALUES (?, ?, ?, ?)`);

/** Aik device aik cheez ko aik dafa report kar sakta hai. 3 reports = khud chhup jata hai. */
export function report(type: ContentType, id: string, device: string): boolean {
  const table = CONTENT_TABLES[type];
  const exists = db.prepare(`SELECT 1 FROM ${table} WHERE id = ?`).get(id);
  if (!exists) return false;
  const tx = db.transaction(() => {
    const r = qReport.run(type, id, device, Date.now());
    if (r.changes === 0) return; // pehle hi report kiya hua
    db.prepare(`UPDATE ${table} SET reports = reports + 1 WHERE id = ?`).run(id);
    db.prepare(`UPDATE ${table} SET status = 'hidden' WHERE id = ? AND reports >= ? AND status <> 'winner'`).run(
      id,
      REPORT_HIDE_AT,
    );
  });
  tx();
  return true;
}

export function setStatus(type: ContentType, id: string, status: "hidden" | "live" | "candidate") {
  db.prepare(`UPDATE ${CONTENT_TABLES[type]} SET status = ? WHERE id = ?`).run(status, id);
}

export function adminList(type: ContentType, filter: "reported" | "recent") {
  const table = CONTENT_TABLES[type];
  const where = filter === "reported" ? "WHERE reports > 0 OR status = 'hidden'" : "";
  return db.prepare(`SELECT id, text, country, status, reports, created_at FROM ${table} ${where} ORDER BY created_at DESC LIMIT 100`).all();
}

export function countToday(table: string, day: string, device: string): number {
  return (db.prepare(`SELECT COUNT(*) n FROM ${table} WHERE day = ? AND device = ?`).get(day, device) as { n: number }).n;
}
