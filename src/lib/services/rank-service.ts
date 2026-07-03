import { and, asc, count, desc, eq, ilike, like } from "drizzle-orm";

import type { RankType } from "@/lib/constants";
import { usePostgres } from "@/lib/db/config";
import { db, initDatabase, games, rankSnapshots } from "@/lib/db";
import { getSqliteDb } from "@/lib/db/sqlite";
import type {
  DashboardStats,
  GameTrendPoint,
  ImportPayload,
  ImportRankItem,
  RankEntry,
  RisingGame,
} from "@/lib/types";

type RankingRow = {
  gameId: number;
  appId: string | null;
  name: string;
  publisher: string | null;
  category: string | null;
  iconUrl: string | null;
  rank: number;
};

export async function ensureDb() {
  await initDatabase();
}

export async function getAvailableDates(): Promise<string[]> {
  await ensureDb();
  const rows = (await db
    .selectDistinct({ date: rankSnapshots.snapshotDate })
    .from(rankSnapshots)
    .orderBy(desc(rankSnapshots.snapshotDate))) as Array<{ date: string }>;
  return rows.map((row) => row.date);
}

export async function getLatestDate(): Promise<string | null> {
  const dates = await getAvailableDates();
  return dates[0] ?? null;
}

async function getPreviousDate(date: string): Promise<string | null> {
  const dates = await getAvailableDates();
  const index = dates.indexOf(date);
  return dates[index + 1] ?? null;
}

async function getDateDaysAgo(date: string, days: number): Promise<string | null> {
  const dates = await getAvailableDates();
  const index = dates.indexOf(date);
  return dates[index + days] ?? null;
}

async function getRankMap(date: string, rankType: RankType) {
  await ensureDb();
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
        eq(rankSnapshots.rankType, rankType),
      ),
    )) as Array<{ gameId: number; rank: number }>;

  return new Map(rows.map((row) => [row.gameId, row.rank]));
}

export async function getRankings(
  rankType: RankType,
  date?: string,
): Promise<{ date: string; previousDate: string | null; items: RankEntry[] }> {
  await ensureDb();
  const targetDate = date ?? (await getLatestDate());
  if (!targetDate) {
    return { date: "", previousDate: null, items: [] };
  }

  const previousDate = await getPreviousDate(targetDate);
  const previousMap = previousDate
    ? await getRankMap(previousDate, rankType)
    : new Map<number, number>();

  const currentRows = (await db
    .select({
      gameId: games.id,
      appId: games.appId,
      name: games.name,
      publisher: games.publisher,
      category: games.category,
      iconUrl: games.iconUrl,
      rank: rankSnapshots.rank,
    })
    .from(rankSnapshots)
    .innerJoin(games, eq(rankSnapshots.gameId, games.id))
    .where(
      and(
        eq(rankSnapshots.snapshotDate, targetDate),
        eq(rankSnapshots.rankType, rankType),
      ),
    )
    .orderBy(asc(rankSnapshots.rank))) as RankingRow[];

  const items: RankEntry[] = currentRows.map((row) => {
    const previousRank = previousMap.get(row.gameId) ?? null;
    const rankChange =
      previousRank !== null ? previousRank - row.rank : null;

    return {
      gameId: row.gameId,
      appId: row.appId,
      name: row.name,
      publisher: row.publisher,
      category: row.category,
      iconUrl: row.iconUrl,
      rank: row.rank,
      previousRank,
      rankChange,
      isNew: previousRank === null,
    };
  });

  return { date: targetDate, previousDate, items };
}

async function countConsecutiveDaysUp(
  gameId: number,
  rankType: RankType,
  endDate: string,
): Promise<number> {
  const dates = await getAvailableDates();
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
          eq(rankSnapshots.rankType, rankType),
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
          eq(rankSnapshots.rankType, rankType),
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

export async function getRisingGames(
  rankType: RankType,
  date?: string,
  limit = 20,
): Promise<{ date: string; items: RisingGame[] }> {
  await ensureDb();
  const targetDate = date ?? (await getLatestDate());
  if (!targetDate) {
    return { date: "", items: [] };
  }

  const previousDate = await getPreviousDate(targetDate);
  const weekAgoDate = await getDateDaysAgo(targetDate, 6);
  const previousMap = previousDate
    ? await getRankMap(previousDate, rankType)
    : new Map<number, number>();
  const weekAgoMap = weekAgoDate
    ? await getRankMap(weekAgoDate, rankType)
    : new Map<number, number>();

  const { items: currentItems } = await getRankings(rankType, targetDate);

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
      const consecutiveDaysUp = await countConsecutiveDaysUp(
        item.gameId,
        rankType,
        targetDate,
      );
      return {
        ...item,
        consecutiveDaysUp,
        risingScore:
          item.dailyChange * 0.4 + item.weeklyChange * 0.3 + consecutiveDaysUp * 2,
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

export async function getGameTrend(
  gameId: number,
  rankType: RankType,
  days = 30,
): Promise<GameTrendPoint[]> {
  await ensureDb();
  const rows = (await db
    .select({
      date: rankSnapshots.snapshotDate,
      rank: rankSnapshots.rank,
    })
    .from(rankSnapshots)
    .where(
      and(
        eq(rankSnapshots.gameId, gameId),
        eq(rankSnapshots.rankType, rankType),
      ),
    )
    .orderBy(asc(rankSnapshots.snapshotDate))) as GameTrendPoint[];

  return rows.slice(-days);
}

export async function getGameById(gameId: number) {
  await ensureDb();
  const [game] = await db.select().from(games).where(eq(games.id, gameId)).limit(1);
  return game ?? null;
}

export async function getDashboardStats(
  rankType: RankType = "bestseller",
): Promise<DashboardStats> {
  await ensureDb();
  const latestDate = await getLatestDate();
  const previousDate = latestDate ? await getPreviousDate(latestDate) : null;
  const [gameCount] = await db.select({ count: count() }).from(games);
  const [snapshotCountRow] = await db
    .select({ count: count() })
    .from(rankSnapshots);
  const { items: risingItems } = await getRisingGames(
    rankType,
    latestDate ?? undefined,
    1,
  );

  return {
    latestDate,
    previousDate,
    totalGames: gameCount?.count ?? 0,
    snapshotCount: snapshotCountRow?.count ?? 0,
    topRiser: risingItems[0] ?? null,
  };
}

async function upsertRankItemAsync(
  tx: typeof db,
  payload: ImportPayload,
  item: ImportRankItem,
  now: string,
) {
  let [game] = await tx
    .select()
    .from(games)
    .where(eq(games.name, item.name))
    .limit(1);

  if (!game && item.appId) {
    [game] = await tx
      .select()
      .from(games)
      .where(eq(games.appId, item.appId))
      .limit(1);
  }

  if (!game) {
    [game] = await tx
      .insert(games)
      .values({
        appId: item.appId ?? null,
        name: item.name,
        publisher: item.publisher ?? null,
        category: item.category ?? null,
        iconUrl: item.iconUrl ?? null,
        createdAt: now,
      })
      .returning();
  } else {
    await tx
      .update(games)
      .set({
        appId: item.appId ?? game.appId,
        publisher: item.publisher ?? game.publisher,
        category: item.category ?? game.category,
        iconUrl: item.iconUrl ?? game.iconUrl,
      })
      .where(eq(games.id, game.id));
  }

  if (!game) return;

  await tx
    .insert(rankSnapshots)
    .values({
      snapshotDate: payload.date,
      rankType: payload.rankType,
      gameId: game.id,
      rank: item.rank,
      createdAt: now,
    })
    .onConflictDoUpdate({
      target: [
        rankSnapshots.snapshotDate,
        rankSnapshots.rankType,
        rankSnapshots.gameId,
      ],
      set: { rank: item.rank, createdAt: now },
    });
}

function upsertRankItemSync(
  tx: typeof db,
  payload: ImportPayload,
  item: ImportRankItem,
  now: string,
) {
  let game =
    tx.select().from(games).where(eq(games.name, item.name)).get() ??
    (item.appId
      ? tx.select().from(games).where(eq(games.appId, item.appId)).get()
      : undefined);

  if (!game) {
    game = tx
      .insert(games)
      .values({
        appId: item.appId ?? null,
        name: item.name,
        publisher: item.publisher ?? null,
        category: item.category ?? null,
        iconUrl: item.iconUrl ?? null,
        createdAt: now,
      })
      .returning()
      .get();
  } else {
    tx.update(games)
      .set({
        appId: item.appId ?? game.appId,
        publisher: item.publisher ?? game.publisher,
        category: item.category ?? game.category,
        iconUrl: item.iconUrl ?? game.iconUrl,
      })
      .where(eq(games.id, game.id))
      .run();
  }

  if (!game) return;

  tx.insert(rankSnapshots)
    .values({
      snapshotDate: payload.date,
      rankType: payload.rankType,
      gameId: game.id,
      rank: item.rank,
      createdAt: now,
    })
    .onConflictDoUpdate({
      target: [
        rankSnapshots.snapshotDate,
        rankSnapshots.rankType,
        rankSnapshots.gameId,
      ],
      set: { rank: item.rank, createdAt: now },
    })
    .run();
}

export async function importRankSnapshot(payload: ImportPayload) {
  await ensureDb();
  const now = new Date().toISOString();

  if (usePostgres()) {
    await db.transaction(async (tx: typeof db) => {
      for (const item of payload.items) {
        await upsertRankItemAsync(tx, payload, item, now);
      }
    });
  } else {
    getSqliteDb().transaction((tx) => {
      for (const item of payload.items) {
        upsertRankItemSync(tx, payload, item, now);
      }
    });
  }

  return { success: true, count: payload.items.length };
}

export async function searchGames(query: string, limit = 10) {
  await ensureDb();
  const pattern = `%${query}%`;
  return db
    .select()
    .from(games)
    .where(usePostgres() ? ilike(games.name, pattern) : like(games.name, pattern))
    .limit(limit);
}

export async function getGamesOnRank(date: string, rankType: RankType) {
  await ensureDb();
  return db
    .select({
      gameId: games.id,
      name: games.name,
      rank: rankSnapshots.rank,
    })
    .from(rankSnapshots)
    .innerJoin(games, eq(rankSnapshots.gameId, games.id))
    .where(
      and(
        eq(rankSnapshots.snapshotDate, date),
        eq(rankSnapshots.rankType, rankType),
      ),
    )
    .orderBy(asc(rankSnapshots.rank));
}

export async function getNewEntries(
  rankType: RankType,
  date?: string,
): Promise<RankEntry[]> {
  const { items } = await getRankings(rankType, date);
  return items.filter((item) => item.isNew);
}

export async function getDroppedGames(
  rankType: RankType,
  date?: string,
): Promise<Array<{ gameId: number; name: string; lastRank: number }>> {
  await ensureDb();
  const targetDate = date ?? (await getLatestDate());
  if (!targetDate) return [];

  const previousDate = await getPreviousDate(targetDate);
  if (!previousDate) return [];

  const currentGameIds = new Set(
    (await getRankings(rankType, targetDate)).items.map((item) => item.gameId),
  );

  const previousRows = (await db
    .select({
      gameId: games.id,
      name: games.name,
      rank: rankSnapshots.rank,
    })
    .from(rankSnapshots)
    .innerJoin(games, eq(rankSnapshots.gameId, games.id))
    .where(
      and(
        eq(rankSnapshots.snapshotDate, previousDate),
        eq(rankSnapshots.rankType, rankType),
      ),
    )) as Array<{ gameId: number; name: string; rank: number }>;

  return previousRows
    .filter((row) => !currentGameIds.has(row.gameId))
    .map((row) => ({
      gameId: row.gameId,
      name: row.name,
      lastRank: row.rank,
    }));
}
