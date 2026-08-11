import { and, asc, desc, eq } from "drizzle-orm";

import {
  DOUYIN_APP_ID_PREFIX,
  toDouyinStorageRankType,
  type DouyinRankType,
} from "@/lib/douyin";
import { db, initDatabase, games, rankSnapshots } from "@/lib/db";
import { parseRankLabelsJson } from "@/lib/rank-labels";
import type {
  GameTrendPoint,
  ImportRankItem,
  RankEntry,
  RisingGame,
} from "@/lib/types";

export interface DouyinGame {
  id: number;
  appId: string | null;
  name: string;
  publisher: string | null;
  category: string | null;
  iconUrl: string | null;
}

export interface DouyinFetchedRankItem extends ImportRankItem {
  rank: number;
  name: string;
  rankingChange?: number | null;
  rankData?: Array<{ date: string; rankValue: number }>;
}

type RankingRow = {
  gameId: number;
  appId: string | null;
  name: string;
  publisher: string | null;
  category: string | null;
  iconUrl: string | null;
  rank: number;
  rankLabels: string | null;
  createdAt: string;
};

async function ensureDb() {
  await initDatabase();
}

function keepLatestSnapshotBatch<T extends { createdAt: string }>(rows: T[]): T[] {
  if (rows.length === 0) return rows;
  const latestBatchAt = rows.reduce(
    (max, row) => (row.createdAt > max ? row.createdAt : max),
    rows[0]!.createdAt,
  );
  return rows.filter((row) => row.createdAt === latestBatchAt);
}

function normalizeRankEntries(items: RankEntry[]): RankEntry[] {
  return items.map((item, index) => {
    const rank = index + 1;
    return {
      ...item,
      rank,
      rankChange:
        item.previousRank !== null ? item.previousRank - rank : item.rankChange,
    };
  });
}

export async function getDouyinAvailableDates(): Promise<string[]> {
  await ensureDb();
  const rows = (await db
    .selectDistinct({
      date: rankSnapshots.snapshotDate,
      rankType: rankSnapshots.rankType,
    })
    .from(rankSnapshots)
    .orderBy(desc(rankSnapshots.snapshotDate))) as Array<{
    date: string;
    rankType: string;
  }>;

  return [
    ...new Set(
      rows
        .filter((row) => row.rankType.startsWith("dy:"))
        .map((row) => row.date),
    ),
  ];
}

export async function hasDouyinRankData(): Promise<boolean> {
  const dates = await getDouyinAvailableDates();
  return dates.length > 0;
}

async function getDouyinRankMap(date: string, rankType: DouyinRankType) {
  await ensureDb();
  const storageType = toDouyinStorageRankType(rankType);
  const rows = (await db
    .select({
      gameId: games.id,
      rank: rankSnapshots.rank,
    })
    .from(rankSnapshots)
    .innerJoin(games, eq(rankSnapshots.gameId, games.id))
    .where(
      and(
        eq(rankSnapshots.snapshotDate, date),
        eq(rankSnapshots.rankType, storageType),
      ),
    )) as Array<{ gameId: number; rank: number }>;

  return new Map(rows.map((row) => [row.gameId, row.rank]));
}

export async function getDouyinRankings(
  rankType: DouyinRankType,
  selectedDate?: string,
  availableDates?: string[],
): Promise<{
  date: string;
  previousDate: string | null;
  items: RankEntry[];
}> {
  await ensureDb();
  const dates = availableDates ?? (await getDouyinAvailableDates());
  const targetDate =
    selectedDate && dates.includes(selectedDate) ? selectedDate : dates[0] ?? "";
  if (!targetDate) {
    return { date: "", previousDate: null, items: [] };
  }

  const dateIndex = dates.indexOf(targetDate);
  const previousDate = dateIndex >= 0 ? (dates[dateIndex + 1] ?? null) : null;
  const storageType = toDouyinStorageRankType(rankType);

  const rows = keepLatestSnapshotBatch(
    (await db
      .select({
        gameId: games.id,
        appId: games.appId,
        name: games.name,
        publisher: games.publisher,
        category: games.category,
        iconUrl: games.iconUrl,
        rank: rankSnapshots.rank,
        rankLabels: rankSnapshots.rankLabels,
        createdAt: rankSnapshots.createdAt,
      })
      .from(rankSnapshots)
      .innerJoin(games, eq(rankSnapshots.gameId, games.id))
      .where(
        and(
          eq(rankSnapshots.snapshotDate, targetDate),
          eq(rankSnapshots.rankType, storageType),
        ),
      )
      .orderBy(asc(rankSnapshots.rank))) as RankingRow[],
  );

  const previousMap = previousDate
    ? await getDouyinRankMap(previousDate, rankType)
    : new Map<number, number>();

  const items = normalizeRankEntries(
    rows.map((row) => {
      const previousRank = previousMap.get(row.gameId) ?? null;
      return {
        gameId: row.gameId,
        appId: row.appId,
        name: row.name,
        publisher: row.publisher,
        category: row.category,
        iconUrl: row.iconUrl,
        rank: row.rank,
        previousRank,
        rankChange: previousRank !== null ? previousRank - row.rank : null,
        isNew: previousRank === null && Boolean(previousDate),
        rankLabels: parseRankLabelsJson(row.rankLabels),
      };
    }),
  );

  return { date: targetDate, previousDate, items };
}

function previousDateFrom(dates: string[], date: string): string | null {
  const index = dates.indexOf(date);
  return index >= 0 ? (dates[index + 1] ?? null) : null;
}

function dateDaysAgoFrom(
  dates: string[],
  date: string,
  days: number,
): string | null {
  const index = dates.indexOf(date);
  return index >= 0 ? (dates[index + days] ?? null) : null;
}

async function countDouyinConsecutiveDaysUp(
  gameId: number,
  rankType: DouyinRankType,
  endDate: string,
  dates: string[],
): Promise<number> {
  const storageType = toDouyinStorageRankType(rankType);
  const endIndex = dates.indexOf(endDate);
  if (endIndex === -1) return 0;

  let streak = 0;
  for (let i = endIndex; i > 0; i -= 1) {
    const currentDate = dates[i]!;
    const prevDate = dates[i - 1]!;
    const [currentRow] = await db
      .select({ rank: rankSnapshots.rank })
      .from(rankSnapshots)
      .where(
        and(
          eq(rankSnapshots.gameId, gameId),
          eq(rankSnapshots.snapshotDate, currentDate),
          eq(rankSnapshots.rankType, storageType),
        ),
      )
      .limit(1);

    const [prevRow] = await db
      .select({ rank: rankSnapshots.rank })
      .from(rankSnapshots)
      .where(
        and(
          eq(rankSnapshots.gameId, gameId),
          eq(rankSnapshots.snapshotDate, prevDate),
          eq(rankSnapshots.rankType, storageType),
        ),
      )
      .limit(1);

    if (
      currentRow?.rank !== undefined &&
      prevRow?.rank !== undefined &&
      currentRow.rank < prevRow.rank
    ) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
}

export async function getDouyinRisingGames(
  rankType: DouyinRankType,
  date?: string,
  limit = 30,
): Promise<{ date: string; items: RisingGame[] }> {
  await ensureDb();
  const dates = await getDouyinAvailableDates();
  const targetDate =
    date && dates.includes(date) ? date : dates[0] ?? "";
  if (!targetDate) {
    return { date: "", items: [] };
  }

  const previousDate = previousDateFrom(dates, targetDate);
  const weekAgoDate = dateDaysAgoFrom(dates, targetDate, 6);
  const previousMap = previousDate
    ? await getDouyinRankMap(previousDate, rankType)
    : new Map<number, number>();
  const weekAgoMap = weekAgoDate
    ? await getDouyinRankMap(weekAgoDate, rankType)
    : new Map<number, number>();

  const { items: currentItems } = await getDouyinRankings(
    rankType,
    targetDate,
    dates,
  );

  const rising: RisingGame[] = currentItems
    .map((item) => {
      const previousRank = previousMap.get(item.gameId) ?? null;
      const weekAgoRank = weekAgoMap.get(item.gameId) ?? null;
      const dailyChange =
        previousRank !== null ? previousRank - item.rank : 0;
      const weeklyChange =
        weekAgoRank !== null ? weekAgoRank - item.rank : dailyChange;

      return {
        gameId: item.gameId,
        appId: item.appId,
        name: item.name,
        publisher: item.publisher,
        category: item.category,
        iconUrl: item.iconUrl,
        currentRank: item.rank,
        previousRank,
        dailyChange,
        weeklyChange,
        consecutiveDaysUp: 0,
        risingScore: dailyChange * 0.4 + weeklyChange * 0.3,
      };
    })
    .filter((item) => item.risingScore > 0);

  const withStreak = await Promise.all(
    rising.map(async (item) => {
      const consecutiveDaysUp = await countDouyinConsecutiveDaysUp(
        item.gameId,
        rankType,
        targetDate,
        dates,
      );
      return {
        ...item,
        consecutiveDaysUp,
        risingScore:
          item.dailyChange * 0.4 +
          item.weeklyChange * 0.3 +
          consecutiveDaysUp * 2,
      };
    }),
  );

  return {
    date: targetDate,
    items: withStreak
      .sort((a, b) => b.risingScore - a.risingScore)
      .slice(0, limit),
  };
}

export interface DouyinHomePageData {
  latestDate: string | null;
  date: string;
  popularItems: RankEntry[];
  risingItems: RisingGame[];
}

/** 抖音概览页聚合：热门榜 Top + 增速 Top */
export async function getDouyinHomePageData(
  rankType: DouyinRankType = "popular",
): Promise<DouyinHomePageData> {
  await ensureDb();
  const dates = await getDouyinAvailableDates();
  const latestDate = dates[0] ?? null;

  if (!latestDate) {
    return {
      latestDate: null,
      date: "",
      popularItems: [],
      risingItems: [],
    };
  }

  const rankingsResult = await getDouyinRankings(rankType, latestDate, dates);
  const risingResult = await getDouyinRisingGames(rankType, latestDate, 10);

  return {
    latestDate,
    date: rankingsResult.date,
    popularItems: rankingsResult.items,
    risingItems: risingResult.items,
  };
}

export async function getDouyinGameById(
  gameId: number,
): Promise<DouyinGame | null> {
  await ensureDb();
  const [game] = (await db
    .select()
    .from(games)
    .where(eq(games.id, gameId))
    .limit(1)) as DouyinGame[];

  if (!game?.appId?.startsWith(DOUYIN_APP_ID_PREFIX)) {
    return null;
  }
  return game;
}

export async function getDouyinGameTrend(
  gameId: number,
  rankType: DouyinRankType,
): Promise<GameTrendPoint[]> {
  await ensureDb();
  const storageType = toDouyinStorageRankType(rankType);
  const rows = (await db
    .select({
      date: rankSnapshots.snapshotDate,
      rank: rankSnapshots.rank,
      createdAt: rankSnapshots.createdAt,
    })
    .from(rankSnapshots)
    .where(
      and(
        eq(rankSnapshots.gameId, gameId),
        eq(rankSnapshots.rankType, storageType),
      ),
    )
    .orderBy(asc(rankSnapshots.snapshotDate))) as Array<{
    date: string;
    rank: number;
    createdAt: string;
  }>;

  const byDate = new Map<string, { date: string; rank: number; createdAt: string }>();
  for (const row of rows) {
    const existing = byDate.get(row.date);
    if (!existing || row.createdAt > existing.createdAt) {
      byDate.set(row.date, row);
    }
  }

  return [...byDate.values()]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((row) => ({ date: row.date, rank: row.rank }));
}

/**
 * 仅按 dy: appId 匹配，绝不按游戏名合并微信游戏。
 * mergeOnly=true 时不删除当日旧快照，用于历史日补全。
 */
export async function importDouyinRankSnapshot(payload: {
  date: string;
  rankType: DouyinRankType;
  items: ImportRankItem[];
  mergeOnly?: boolean;
}) {
  await ensureDb();
  const now = new Date().toISOString();
  const storageType = toDouyinStorageRankType(payload.rankType);
  const items = [...payload.items]
    .filter((item) => item.name?.trim() && item.appId?.startsWith(DOUYIN_APP_ID_PREFIX))
    .sort((a, b) => a.rank - b.rank)
    .map((item, index) => ({ ...item, rank: item.rank > 0 ? item.rank : index + 1 }));

  const snapshotFilter = and(
    eq(rankSnapshots.snapshotDate, payload.date),
    eq(rankSnapshots.rankType, storageType),
  );

  if (!payload.mergeOnly) {
    await db.delete(rankSnapshots).where(snapshotFilter);
  }

  // 同批次内缓存 appId -> game，减少 Neon 往返
  const gameCache = new Map<string, { id: number }>();

  for (const item of items) {
    const appId = item.appId!;
    let gameId = gameCache.get(appId)?.id;

    if (gameId == null) {
      const [existing] = await db
        .select({ id: games.id, iconUrl: games.iconUrl })
        .from(games)
        .where(eq(games.appId, appId))
        .limit(1);

      let resolvedId: number;
      if (existing) {
        await db
          .update(games)
          .set({
            name: item.name,
            publisher: item.publisher ?? null,
            category: item.category ?? null,
            // 新图标解析失败时保留旧头像，避免被写成空
            iconUrl: item.iconUrl ?? existing.iconUrl ?? null,
          })
          .where(eq(games.id, existing.id));
        resolvedId = existing.id;
      } else {
        const [created] = await db
          .insert(games)
          .values({
            appId,
            name: item.name,
            publisher: item.publisher ?? null,
            category: item.category ?? null,
            iconUrl: item.iconUrl ?? null,
            createdAt: now,
          })
          .returning({ id: games.id });
        if (!created) continue;
        resolvedId = created.id;
      }
      gameId = resolvedId;
      gameCache.set(appId, { id: resolvedId });
    }

    if (gameId == null) continue;

    const rankLabelsJson =
      item.rankLabels && item.rankLabels.length > 0
        ? JSON.stringify(item.rankLabels)
        : null;

    await db
      .insert(rankSnapshots)
      .values({
        snapshotDate: payload.date,
        rankType: storageType,
        gameId,
        rank: item.rank,
        rankLabels: rankLabelsJson,
        createdAt: now,
      })
      .onConflictDoUpdate({
        target: [
          rankSnapshots.snapshotDate,
          rankSnapshots.rankType,
          rankSnapshots.gameId,
        ],
        set: { rank: item.rank, rankLabels: rankLabelsJson, createdAt: now },
      });
  }

  return { success: true, count: items.length };
}
