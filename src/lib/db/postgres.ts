import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";

import * as schema from "./schema.pg";

type PgDb = NeonHttpDatabase<typeof schema>;

let pgDb: PgDb | null = null;

export function getPostgresDb(): PgDb {
  if (!pgDb) {
    const url = process.env.POSTGRES_URL?.trim();
    if (!url) {
      throw new Error("POSTGRES_URL 未配置");
    }
    pgDb = drizzle(neon(url), { schema });
  }
  return pgDb;
}

export async function initPostgresDatabase() {
  const url = process.env.POSTGRES_URL?.trim();
  if (!url) {
    throw new Error("POSTGRES_URL 未配置");
  }

  const sql = neon(url);

  await sql`
    CREATE TABLE IF NOT EXISTS games (
      id SERIAL PRIMARY KEY,
      app_id TEXT UNIQUE,
      name TEXT NOT NULL,
      publisher TEXT,
      category TEXT,
      icon_url TEXT,
      created_at TEXT NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS rank_snapshots (
      id SERIAL PRIMARY KEY,
      snapshot_date TEXT NOT NULL,
      rank_type TEXT NOT NULL,
      game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
      rank INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(snapshot_date, rank_type, game_id)
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_snapshots_date_type
    ON rank_snapshots(snapshot_date, rank_type)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_snapshots_game
    ON rank_snapshots(game_id, rank_type, snapshot_date)
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS fetch_logs (
      id SERIAL PRIMARY KEY,
      status TEXT NOT NULL,
      message TEXT,
      item_count INTEGER,
      created_at TEXT NOT NULL
    )
  `;
}

export { schema as pgSchema };
