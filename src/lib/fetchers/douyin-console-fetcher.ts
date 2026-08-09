import { format } from "date-fns";

import {
  DOUYIN_CONSOLE_RANK_API,
  DOUYIN_CONSOLE_RANK_TYPE_CODES,
  DOUYIN_CONSOLE_REFERER,
  DOUYIN_RANK_TYPES,
  toDouyinStorageAppId,
  type DouyinRankType,
} from "@/lib/douyin";
import { normalizeIconUrl } from "@/lib/utils/icon";
import {
  importDouyinRankSnapshot,
  type DouyinFetchedRankItem,
} from "@/lib/services/douyin-rank-service";
import { logFetchResult } from "@/lib/services/fetch-log-service";

interface DouyinConsoleGameInfo {
  index?: number;
  name?: string;
  iconUrl?: string;
  schema?: string;
  keyWords?: string[];
  rankingChange?: number;
  newlyListedGame?: boolean;
  continuedTop1?: boolean;
  rankData?: Array<{ date?: string; rankValue?: number }>;
}

interface DouyinConsoleRankResponse {
  data?: {
    gameInfo?: DouyinConsoleGameInfo[];
  };
  error?: number | string;
  message?: string;
  msg?: string;
}

function getDouyinCookie() {
  return process.env.DOUYIN_GAME_COOKIE?.trim() ?? "";
}

export function extractTtAppIdFromSchema(schema?: string): string | undefined {
  if (!schema) return undefined;
  try {
    const query = schema.includes("?") ? schema.split("?")[1] ?? "" : schema;
    const params = new URLSearchParams(query);
    const appId = params.get("app_id")?.trim();
    return appId || undefined;
  } catch {
    return undefined;
  }
}

function buildRankLabels(raw: DouyinConsoleGameInfo): string[] {
  const labels: string[] = [];
  const keywords = raw.keyWords ?? [];
  for (const keyword of keywords.slice(1)) {
    const text = keyword?.trim();
    if (text) labels.push(text);
  }
  if (raw.newlyListedGame) labels.push("新上榜");
  if (raw.continuedTop1) labels.push("登顶十日");
  // keyWords 与 newlyListedGame 可能重复「新上榜」
  return [...new Set(labels)];
}

function parseConsoleItem(
  raw: DouyinConsoleGameInfo,
): DouyinFetchedRankItem | null {
  const name = raw.name?.trim();
  if (!name) return null;

  const ttAppId = extractTtAppIdFromSchema(raw.schema);
  const category = raw.keyWords?.[0]?.trim() || undefined;

  return {
    rank: Number(raw.index) || 0,
    name,
    appId: ttAppId ? toDouyinStorageAppId(ttAppId) : undefined,
    iconUrl: normalizeIconUrl(raw.iconUrl),
    category,
    rankLabels: buildRankLabels(raw),
    rankingChange:
      typeof raw.rankingChange === "number" ? raw.rankingChange : null,
    rankData: (raw.rankData ?? [])
      .filter(
        (point): point is { date: string; rankValue: number } =>
          typeof point.date === "string" &&
          typeof point.rankValue === "number" &&
          point.rankValue > 0,
      )
      .map((point) => ({ date: point.date, rankValue: point.rankValue })),
  };
}

export async function fetchDouyinConsoleRankPage(
  rankType: DouyinRankType,
  page = 1,
  pageSize = 100,
): Promise<DouyinFetchedRankItem[]> {
  const cookie = getDouyinCookie();
  if (!cookie) {
    throw new Error("未配置 DOUYIN_GAME_COOKIE，无法抓取抖音工作台榜单");
  }

  const rankTypeCode = DOUYIN_CONSOLE_RANK_TYPE_CODES[rankType];
  const url = new URL(DOUYIN_CONSOLE_RANK_API);
  url.searchParams.set("page", String(page));
  url.searchParams.set("pageSize", String(pageSize));
  url.searchParams.set("rankType", String(rankTypeCode));

  const response = await fetch(url, {
    headers: {
      Cookie: cookie,
      Accept: "application/json, text/plain, */*",
      Referer: DOUYIN_CONSOLE_REFERER,
      Origin: "https://developer.open-douyin.com",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
    cache: "no-store",
  });

  const text = await response.text();
  let json: DouyinConsoleRankResponse;
  try {
    json = JSON.parse(text) as DouyinConsoleRankResponse;
  } catch {
    throw new Error(
      `抖音接口返回非 JSON（HTTP ${response.status}），Cookie 可能已失效`,
    );
  }

  if (!response.ok) {
    throw new Error(
      json.message ||
        json.msg ||
        `抖音接口 HTTP ${response.status}`,
    );
  }

  const list = json.data?.gameInfo ?? [];
  const items = list
    .map((item) => parseConsoleItem(item))
    .filter((item): item is DouyinFetchedRankItem => item !== null)
    .map((item, index) => ({
      ...item,
      rank: item.rank > 0 ? item.rank : index + 1,
    }));

  return items;
}

export async function fetchDouyinConsoleRank(
  rankType: DouyinRankType,
): Promise<DouyinFetchedRankItem[]> {
  const items = await fetchDouyinConsoleRankPage(rankType, 1, 100);
  if (items.length < 5) {
    throw new Error(`抖音榜单数据不完整，仅解析到 ${items.length} 条`);
  }
  return items.slice(0, 100);
}

export async function fetchAllDouyinConsoleRanks(date?: string) {
  const targetDate = date ?? format(new Date(), "yyyy-MM-dd");
  const results: Array<{
    rankType: DouyinRankType;
    count: number;
    error?: string;
  }> = [];

  for (const rankType of DOUYIN_RANK_TYPES) {
    try {
      const items = await fetchDouyinConsoleRank(rankType);
      await importDouyinRankSnapshot({
        date: targetDate,
        rankType,
        items,
      });
      results.push({ rankType, count: items.length });
    } catch (error) {
      results.push({
        rankType,
        count: 0,
        error: error instanceof Error ? error.message : "抓取失败",
      });
    }
  }

  const successCount = results.filter((item) => item.count > 0).length;
  const status = successCount > 0 ? "success" : "failed";
  const message =
    successCount === DOUYIN_RANK_TYPES.length
      ? `已成功抓取 ${targetDate} 全部抖音榜单（工作台热点风向）`
      : successCount > 0
        ? `部分成功：${successCount}/${DOUYIN_RANK_TYPES.length} 个抖音榜单`
        : "抖音抓取失败，请检查 DOUYIN_GAME_COOKIE 是否有效";

  await logFetchResult({
    status,
    message,
    itemCount: results.reduce((sum, item) => sum + item.count, 0),
  });

  return {
    success: successCount > 0,
    date: targetDate,
    results,
    message,
  };
}

export function getDouyinConsoleConfigStatus() {
  return {
    source: "douyin_console",
    hasCookie: Boolean(getDouyinCookie()),
  };
}
