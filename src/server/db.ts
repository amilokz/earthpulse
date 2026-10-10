import "server-only";
import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";

// SQLite: koi alag DB server nahi (kam RAM wale VPS ke liye). Baad mein
// MySQL/Postgres par shift karna ho to sirf ye file + queries badlengi.
const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "earthpulse.db");

const SCHEMA = `
CREATE TABLE IF NOT EXISTS moods (
  day TEXT NOT NULL,
  device TEXT NOT NULL,
  country TEXT NOT NULL,
  mood INTEGER NOT NULL CHECK (mood BETWEEN 1 AND 5),
  ip_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (day, device)
);
CREATE INDEX IF NOT EXISTS moods_day_country ON moods(day, country);
CREATE INDEX IF NOT EXISTS moods_day_ip ON moods(day, ip_hash);

CREATE TABLE IF NOT EXISTS kindness (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL,
  country TEXT NOT NULL,
  device TEXT NOT NULL,
  day TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'live',
  reports INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS kindness_status ON kindness(status);

CREATE TABLE IF NOT EXISTS capsules (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  nickname TEXT,
  country TEXT NOT NULL,
  device TEXT NOT NULL,
  day TEXT NOT NULL,
  visibility TEXT NOT NULL CHECK (visibility IN ('public','private')),
  created_at INTEGER NOT NULL,
  unlock_at INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'live',
  reports INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS capsules_unlock ON capsules(visibility, status, unlock_at);
CREATE INDEX IF NOT EXISTS capsules_device ON capsules(device);

CREATE TABLE IF NOT EXISTS story_lines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  day TEXT NOT NULL,
  text TEXT NOT NULL,
  nickname TEXT,
  country TEXT NOT NULL,
  device TEXT NOT NULL,
  votes INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'candidate',
  reports INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS story_day ON story_lines(day, status);
CREATE UNIQUE INDEX IF NOT EXISTS story_one_per_day ON story_lines(day, device) WHERE device <> 'system';

CREATE TABLE IF NOT EXISTS story_votes (
  day TEXT NOT NULL,
  device TEXT NOT NULL,
  line_id INTEGER NOT NULL,
  PRIMARY KEY (day, device)
);

CREATE TABLE IF NOT EXISTS reports (
  type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  device TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (type, target_id, device)
);
`;

function open() {
  mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("synchronous = NORMAL");
  db.pragma("busy_timeout = 5000");
  db.exec(SCHEMA);
  return db;
}

// Dev mein hot-reload par naya connection na bane
const g = globalThis as unknown as { __epdb?: Database.Database };
export const db = g.__epdb ?? (g.__epdb = open());
