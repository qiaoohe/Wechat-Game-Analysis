import { desc, eq } from "drizzle-orm";

import { db, initDatabase, insightSnapshots } from "@/lib/db";
import type { HotSearchVisitItem, HotWordItem } from "@/lib/types";

export type InsightType = "hot_words" | "hot_search";

type InsightItems<T extends InsightType> = T extends "hot_words"
  ? HotWordItem[]
  : HotSearchVisitItem[];

async function ensureDb() {
  await initDatabase();
}

export async function saveInsightSnapshot<T extends InsightType>(
  insightType: T,
  dataDate: string,
  items: InsightItems<T>,
) {
  if (!dataDate || items.length === 0) {
    return;
  }

  await ensureDb();
  const fetchedAt = new Date().toISOString();

  await db
    .insert(insightSnapshots)
    .values({
      insightType,
      dataDate,
      payload: JSON.stringify(items),
      fetchedAt,
    })
    .onConflictDoUpdate({
      target: [insightSnapshots.insightType, insightSnapshots.dataDate],
      set: {
        payload: JSON.stringify(items),
        fetchedAt,
      },
    });
}

export async function getLatestInsightSnapshot<T extends InsightType>(
  insightType: T,
): Promise<{ dataDate: string; items: InsightItems<T>; fetchedAt: string } | null> {
  await ensureDb();

  const [row] = await db
    .select()
    .from(insightSnapshots)
    .where(eq(insightSnapshots.insightType, insightType))
    .orderBy(desc(insightSnapshots.dataDate))
    .limit(1);

  if (!row?.payload) {
    return null;
  }

  try {
    const items = JSON.parse(row.payload) as InsightItems<T>;
    if (!Array.isArray(items) || items.length === 0) {
      return null;
    }

    return {
      dataDate: row.dataDate,
      items,
      fetchedAt: row.fetchedAt,
    };
  } catch {
    return null;
  }
}
