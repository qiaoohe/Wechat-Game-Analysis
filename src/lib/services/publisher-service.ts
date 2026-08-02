import { and, asc, eq, isNotNull, isNull, ne, or, sql } from "drizzle-orm";

import type { RankType } from "@/lib/constants";
import { db, games, initDatabase } from "@/lib/db";
import { fetchOfficialGameCompany } from "@/lib/fetchers/wechat-official-detail-fetcher";

export interface GameMissingPublisher {
  id: number;
  appId: string;
  name: string;
}

export interface EnrichPublishersResult {
  scanned: number;
  updated: number;
  skipped: number;
  failed: number;
  errors: Array<{ appId: string; name: string; error: string }>;
}

export interface PublisherGameItem {
  gameId: number;
  appId: string | null;
  name: string;
  category: string | null;
  iconUrl: string | null;
  rank: number | null;
  previousRank: number | null;
  rankChange: number | null;
  isNew: boolean;
  rankLabels: string[];
}

export interface PublisherPageData {
  name: string;
  date: string;
  gameCount: number;
  onListCount: number;
  bestRank: number | null;
  games: PublisherGameItem[];
}

/** 官网无开发商或详情页 404 时写入，避免每日重复请求 */
export const PUBLISHER_UNAVAILABLE = "未公开";

/** 列表 / 详情展示用：过滤空值与「未公开」占位 */
export function formatPublisher(
  value: string | null | undefined,
): string | null {
  const text = value?.trim();
  if (!text || text === PUBLISHER_UNAVAILABLE) return null;
  return text;
}

/** 公司主页路径；无有效公司名时返回 null（交由 Next Link 处理编码） */
export function publisherPath(
  publisher: string | null | undefined,
): string | null {
  const name = formatPublisher(publisher);
  if (!name) return null;
  return `/publishers/${name}`;
}

/** 从 URL slug 还原公司名 */
export function decodePublisherSlug(slug: string): string | null {
  let raw = slug.trim();
  try {
    raw = decodeURIComponent(raw);
  } catch {
    // 保持原值
  }
  return formatPublisher(raw);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isNotFoundError(error: unknown) {
  return error instanceof Error && /\(404\)/.test(error.message);
}

/** 列出有 AppID、但尚未录入公司信息的游戏 */
export async function listGamesMissingPublisher(
  limit = 200,
): Promise<GameMissingPublisher[]> {
  await initDatabase();

  const rows = (await db
    .select({
      id: games.id,
      appId: games.appId,
      name: games.name,
    })
    .from(games)
    .where(
      and(
        isNotNull(games.appId),
        or(isNull(games.publisher), eq(games.publisher, "")),
      ),
    )
    .limit(limit)) as Array<{
    id: number;
    appId: string | null;
    name: string;
  }>;

  return rows
    .filter((row): row is { id: number; appId: string; name: string } =>
      Boolean(row.appId?.trim()),
    )
    .map((row) => ({
      id: row.id,
      appId: row.appId.trim(),
      name: row.name,
    }));
}

export async function updateGamePublisher(
  gameId: number,
  publisher: string,
): Promise<void> {
  await initDatabase();
  await db
    .update(games)
    .set({ publisher })
    .where(eq(games.id, gameId));
}

/**
 * 从微信小游戏官网详情页补全 publisher。
 * 仅处理 publisher 为空且有 appId 的游戏；限速避免打爆官网。
 */
export async function enrichPublishersFromOfficial(options?: {
  limit?: number;
  delayMs?: number;
}): Promise<EnrichPublishersResult> {
  const limit = options?.limit ?? 200;
  const delayMs = options?.delayMs ?? 1000;

  const targets = await listGamesMissingPublisher(limit);
  const result: EnrichPublishersResult = {
    scanned: targets.length,
    updated: 0,
    skipped: 0,
    failed: 0,
    errors: [],
  };

  for (let i = 0; i < targets.length; i += 1) {
    const game = targets[i]!;
    try {
      const info = await fetchOfficialGameCompany(game.appId);
      if (!info.publisher) {
        await updateGamePublisher(game.id, PUBLISHER_UNAVAILABLE);
        result.skipped += 1;
      } else {
        await updateGamePublisher(game.id, info.publisher);
        result.updated += 1;
      }
    } catch (error) {
      if (isNotFoundError(error)) {
        await updateGamePublisher(game.id, PUBLISHER_UNAVAILABLE);
        result.skipped += 1;
      } else {
        result.failed += 1;
        result.errors.push({
          appId: game.appId,
          name: game.name,
          error: error instanceof Error ? error.message : "未知错误",
        });
      }
    }

    if (i < targets.length - 1 && delayMs > 0) {
      await sleep(delayMs);
    }
  }

  return result;
}

/** 统计 publisher 覆盖情况（调试用） */
export async function getPublisherCoverage() {
  await initDatabase();
  const [row] = await db
    .select({
      total: sql<number>`count(*)`,
      withAppId: sql<number>`count(${games.appId})`,
      withPublisher: sql<number>`count(${games.publisher})`,
    })
    .from(games);

  return {
    total: Number(row?.total ?? 0),
    withAppId: Number(row?.withAppId ?? 0),
    withPublisher: Number(row?.withPublisher ?? 0),
  };
}

/** 公司主页：旗下游戏 + 指定榜单最新排名 */
export async function getPublisherPage(
  publisherName: string,
  rankType: RankType = "bestseller",
): Promise<PublisherPageData | null> {
  const name = formatPublisher(publisherName);
  if (!name) return null;

  await initDatabase();

  const gameRows = (await db
    .select({
      gameId: games.id,
      appId: games.appId,
      name: games.name,
      publisher: games.publisher,
      category: games.category,
      iconUrl: games.iconUrl,
    })
    .from(games)
    .where(eq(games.publisher, name))
    .orderBy(asc(games.name))) as Array<{
    gameId: number;
    appId: string | null;
    name: string;
    publisher: string | null;
    category: string | null;
    iconUrl: string | null;
  }>;

  // 兼容历史数据里首尾空格不一致的情况
  let owned = gameRows;
  if (owned.length === 0) {
    const candidates = (await db
      .select({
        gameId: games.id,
        appId: games.appId,
        name: games.name,
        publisher: games.publisher,
        category: games.category,
        iconUrl: games.iconUrl,
      })
      .from(games)
      .where(
        and(
          isNotNull(games.publisher),
          ne(games.publisher, ""),
          ne(games.publisher, PUBLISHER_UNAVAILABLE),
        ),
      )
      .orderBy(asc(games.name))) as typeof gameRows;

    owned = candidates.filter(
      (row) => formatPublisher(row.publisher) === name,
    );
  }

  if (owned.length === 0) return null;

  const { getRankings } = await import("@/lib/services/rank-service");
  const { date, items: rankItems } = await getRankings(rankType);
  const rankByGameId = new Map(rankItems.map((item) => [item.gameId, item]));

  const gamesOnPage: PublisherGameItem[] = owned.map((row) => {
    const ranked = rankByGameId.get(row.gameId);
    return {
      gameId: row.gameId,
      appId: row.appId,
      name: row.name,
      category: row.category,
      iconUrl: row.iconUrl,
      rank: ranked?.rank ?? null,
      previousRank: ranked?.previousRank ?? null,
      rankChange: ranked?.rankChange ?? null,
      isNew: ranked?.isNew ?? false,
      rankLabels: ranked?.rankLabels ?? [],
    };
  });

  gamesOnPage.sort((a, b) => {
    if (a.rank !== null && b.rank !== null) return a.rank - b.rank;
    if (a.rank !== null) return -1;
    if (b.rank !== null) return 1;
    return a.name.localeCompare(b.name, "zh-CN");
  });

  const rankedOnly = gamesOnPage.filter((item) => item.rank !== null);
  const bestRank =
    rankedOnly.length > 0
      ? Math.min(...rankedOnly.map((item) => item.rank!))
      : null;

  return {
    name,
    date,
    gameCount: gamesOnPage.length,
    onListCount: rankedOnly.length,
    bestRank,
    games: gamesOnPage,
  };
}

/** 已收录的有效开发商名（用于 sitemap 等） */
export async function listPublisherNames(limit = 500): Promise<string[]> {
  await initDatabase();

  const rows = (await db
    .selectDistinct({ publisher: games.publisher })
    .from(games)
    .where(
      and(
        isNotNull(games.publisher),
        ne(games.publisher, ""),
        ne(games.publisher, PUBLISHER_UNAVAILABLE),
      ),
    )
    .limit(limit)) as Array<{ publisher: string | null }>;

  const names = new Set<string>();
  for (const row of rows) {
    const name = formatPublisher(row.publisher);
    if (name) names.add(name);
  }
  return [...names].sort((a, b) => a.localeCompare(b, "zh-CN"));
}
