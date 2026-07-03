import { desc } from "drizzle-orm";

import { db, initDatabase, type FetchLog } from "@/lib/db";
import { fetchLogs } from "@/lib/db";
import type { FetchLogEntry } from "@/lib/types";

async function ensureDb() {
  await initDatabase();
}

export async function logFetchResult(input: {
  status: string;
  message: string;
  itemCount: number;
}) {
  await ensureDb();
  await db.insert(fetchLogs).values({
    status: input.status,
    message: input.message,
    itemCount: input.itemCount,
    createdAt: new Date().toISOString(),
  });
}

export async function getLatestFetchLog(): Promise<FetchLogEntry | null> {
  await ensureDb();
  const [row] = await db
    .select()
    .from(fetchLogs)
    .orderBy(desc(fetchLogs.createdAt))
    .limit(1);

  if (!row) return null;

  return {
    id: row.id,
    status: row.status,
    message: row.message,
    itemCount: row.itemCount,
    createdAt: row.createdAt,
  };
}

export async function getRecentFetchLogs(limit = 10): Promise<FetchLogEntry[]> {
  await ensureDb();
  const rows = await db
    .select()
    .from(fetchLogs)
    .orderBy(desc(fetchLogs.createdAt))
    .limit(limit);

  return rows.map((row: FetchLog) => ({
    id: row.id,
    status: row.status,
    message: row.message,
    itemCount: row.itemCount,
    createdAt: row.createdAt,
  }));
}
