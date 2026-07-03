import { format } from "date-fns";

import {
  PUBLIC_RANK_PAGE_IDS,
  PUBLIC_RANK_SOURCE,
  RANK_TYPES,
  type RankType,
} from "@/lib/constants";
import type { FetchedRankItem, FetchResult } from "@/lib/types";
import { normalizeIconUrl } from "@/lib/utils/icon";
import { importRankSnapshot } from "@/lib/services/rank-service";
import { logFetchResult, getLatestFetchLog } from "@/lib/services/fetch-log-service";

const FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml",
  "Accept-Language": "zh-CN,zh;q=0.9",
};

interface PublicRankListItem {
  wxag_game?: {
    app_info?: {
      base?: {
        appid?: string;
        appname?: string;
        icon_url?: string;
        game_type_main_name?: string;
        game_type_sub_name?: string;
      };
    };
  };
  sell_point?: {
    appname?: string;
    app_icon?: string;
  };
  pc_appitem?: {
    appid?: string;
    app_info?: {
      app_name?: string;
      app_icon?: string;
    };
  };
}

interface PublicRankDetailData {
  head_info?: { title?: string; rank_id?: number };
  list?: PublicRankListItem[];
}

function extractEmbeddedJson<T>(html: string, globalKey: string): T | null {
  const marker = `window.${globalKey}=`;
  const start = html.indexOf(marker);
  if (start === -1) return null;

  let i = start + marker.length;
  while (i < html.length && /\s/.test(html[i]!)) i += 1;
  if (html[i] !== "{") return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let j = i; j < html.length; j += 1) {
    const ch = html[j]!;

    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }

    if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth === 0) {
        try {
          return JSON.parse(html.slice(i, j + 1)) as T;
        } catch {
          return null;
        }
      }
    }
  }

  return null;
}

function parsePublicRankItem(raw: PublicRankListItem): FetchedRankItem | null {
  const base = raw.wxag_game?.app_info?.base;
  const sellPoint = raw.sell_point;
  const pcApp = raw.pc_appitem?.app_info;

  const name =
    base?.appname?.trim() ||
    sellPoint?.appname?.trim() ||
    pcApp?.app_name?.trim();
  if (!name) return null;

  const appId =
    base?.appid?.trim() ||
    raw.pc_appitem?.appid?.trim() ||
    undefined;

  const iconUrl = normalizeIconUrl(
    base?.icon_url ||
      sellPoint?.app_icon ||
      pcApp?.app_icon,
  );

  const mainType = base?.game_type_main_name?.trim();
  const subType = base?.game_type_sub_name?.trim();
  const category =
    mainType && subType ? `${mainType}/${subType}` : mainType || subType;

  return {
    rank: 0,
    name,
    appId,
    category,
    iconUrl,
  };
}

export async function fetchOfficialRank(
  rankType: RankType,
): Promise<FetchedRankItem[]> {
  const pageId = PUBLIC_RANK_PAGE_IDS[rankType];
  const url = `${PUBLIC_RANK_SOURCE}/rankdetail/${pageId}.html`;

  const response = await fetch(url, {
    headers: FETCH_HEADERS,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`请求失败 (${response.status}): ${url}`);
  }

  const html = await response.text();
  const detail = extractEmbeddedJson<PublicRankDetailData>(html, "__DETAIL_DATA__");

  if (!detail?.list?.length) {
    throw new Error(`页面未包含榜单数据: ${url}`);
  }

  const items = detail.list
    .map((item) => parsePublicRankItem(item))
    .filter((item): item is FetchedRankItem => item !== null)
    .map((item, index) => ({ ...item, rank: index + 1 }));

  if (items.length < 5) {
    throw new Error(`榜单数据不完整，仅解析到 ${items.length} 条`);
  }

  return items.slice(0, 100);
}

export async function fetchAllOfficialRanks(date?: string): Promise<FetchResult> {
  const targetDate = date ?? format(new Date(), "yyyy-MM-dd");
  const results: FetchResult["results"] = [];

  for (const rankType of RANK_TYPES) {
    try {
      const items = await fetchOfficialRank(rankType);
      await importRankSnapshot({ date: targetDate, rankType, items });
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
    successCount === RANK_TYPES.length
      ? `已成功抓取 ${targetDate} 全部榜单（${PUBLIC_RANK_SOURCE}）`
      : successCount > 0
        ? `部分成功：${successCount}/${RANK_TYPES.length} 个榜单`
        : "抓取失败，请检查网络或数据源是否可用";

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

export async function getFetchConfigStatus() {
  return {
    source: PUBLIC_RANK_SOURCE,
    lastLog: await getLatestFetchLog(),
  };
}
