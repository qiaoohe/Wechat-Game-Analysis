import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import fs from "fs";
import path from "path";

import * as schema from "./schema.sqlite";

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "rankings.db");

let sqliteDb: ReturnType<typeof drizzle<typeof schema>> | null = null;
let rawSqlite: Database.Database | null = null;

export function getSqliteDb() {
  if (!sqliteDb) {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    rawSqlite = new Database(dbPath);
    rawSqlite.pragma("journal_mode = WAL");
    rawSqlite.pragma("foreign_keys = ON");
    sqliteDb = drizzle(rawSqlite, { schema });
  }
  return sqliteDb;
}

export function initSqliteDatabase() {
  getSqliteDb();
  rawSqlite!.exec(`
    CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      app_id TEXT UNIQUE,
      name TEXT NOT NULL,
      publisher TEXT,
      category TEXT,
      icon_url TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rank_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      snapshot_date TEXT NOT NULL,
      rank_type TEXT NOT NULL,
      game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
      rank INTEGER NOT NULL,
      rank_labels TEXT,
      created_at TEXT NOT NULL,
      UNIQUE(snapshot_date, rank_type, game_id)
    );

    CREATE INDEX IF NOT EXISTS idx_snapshots_date_type ON rank_snapshots(snapshot_date, rank_type);
    CREATE INDEX IF NOT EXISTS idx_snapshots_game ON rank_snapshots(game_id, rank_type, snapshot_date);

    CREATE TABLE IF NOT EXISTS fetch_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      status TEXT NOT NULL,
      message TEXT,
      item_count INTEGER,
      created_at TEXT NOT NULL
    );
  `);

  try {
    rawSqlite!.exec(`ALTER TABLE rank_snapshots ADD COLUMN rank_labels TEXT`);
  } catch {
    // column already exists
  }
}

export { schema as sqliteSchema };
