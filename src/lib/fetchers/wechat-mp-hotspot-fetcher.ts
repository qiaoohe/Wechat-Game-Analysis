import { format } from "date-fns";

import {
  MP_HOTSPOT_RANK_TYPE_CODES,
  MP_HOTSPOT_SOURCE,
  RANK_TYPES,
  type RankType,
} from "@/lib/constants";
import type { FetchedRankItem, FetchResult } from "@/lib/types";
import { buildRankLabels, type RankBadgeInfo } from "@/lib/rank-labels";
import { normalizeIconUrl } from "@/lib/utils/icon";
import { importRankSnapshot } from "@/lib/services/rank-service";
import { logFetchResult, getLatestFetchLog } from "@/lib/services/fetch-log-service";

const MP_API =
  "https://gamemp.weixin.qq.com/cgi-bin/gamewxagsettingwap/getwxagranklistformp";

const MP_REFERER =
  "https://gamemp.weixin.qq.com/minigame/minigame/minigame_abilitymap/main";

interface MpRankGameItem {
  app_info?: {
    appicon?: string;
    appname?: string;
    app_desc?: string;
    appid?: string;
  };
  rank_badge_info?: RankBadgeInfo;
}

interface MpRankListResponse {
  errcode?: number;
  errmsg?: string;
  data?: {
    rank_game_list?: MpRankGameItem[];
  };
}

function getMpCookie() {
  return process.env.WECHAT_MP_COOKIE?.trim() ?? "";
}

function parseMpRankItem(raw: MpRankGameItem): FetchedRankItem | null {
  const info = raw.app_info;
  const name = info?.appname?.trim();
  if (!name) return null;

  return {
    rank: 0,
    name,
    appId: info?.appid?.trim() || undefined,
    iconUrl: normalizeIconUrl(info?.appicon),
    category: info?.app_desc?.trim() || undefined,
    rankLabels: buildRankLabels(raw.rank_badge_info),
  };
}

export async function fetchMpHotspotRank(
  rankType: RankType,
): Promise<FetchedRankItem[]> {
  const cookie = getMpCookie();
  if (!cookie) {
    throw new Error("未配置 WECHAT_MP_COOKIE，无法抓取 MP 热点创意工具榜单");
  }

  const rankTypeCode = MP_HOTSPOT_RANK_TYPE_CODES[rankType];
  const url = `${MP_API}?rank_type=${rankTypeCode}`;

  const response = await fetch(url, {
    headers: {
      Cookie: cookie,
      Accept: "application/json, text/plain, */*",
      Referer: MP_REFERER,
      Origin: "https://gamemp.weixin.qq.com",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
    cache: "no-store",
  });

  const text = await response.text();
  let json: MpRankListResponse;
  try {
    json = JSON.parse(text) as MpRankListResponse;
  } catch {
    throw new Error(
      `MP 接口返回非 JSON（HTTP ${response.status}），Cookie 可能已失效`,
    );
  }

  if (json.errcode !== 0) {
    throw new Error(
      json.errmsg
        ? `MP 接口错误 ${json.errcode}: ${json.errmsg}`
        : `MP 接口错误 ${json.errcode ?? response.status}`,
    );
  }

  const list = json.data?.rank_game_list ?? [];
  const items = list
    .map((item) => parseMpRankItem(item))
    .filter((item): item is FetchedRankItem => item !== null)
    .map((item, index) => ({ ...item, rank: index + 1 }));

  if (items.length < 5) {
    throw new Error(`MP 榜单数据不完整，仅解析到 ${items.length} 条`);
  }

  return items.slice(0, 100);
}

export async function fetchAllMpHotspotRanks(date?: string): Promise<FetchResult> {
  const targetDate = date ?? format(new Date(), "yyyy-MM-dd");
  const results: FetchResult["results"] = [];

  for (const rankType of RANK_TYPES) {
    try {
      const items = await fetchMpHotspotRank(rankType);
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
      ? `已成功抓取 ${targetDate} 全部榜单（MP 热点创意工具）`
      : successCount > 0
        ? `部分成功：${successCount}/${RANK_TYPES.length} 个榜单（MP）`
        : "MP 抓取失败，请检查 WECHAT_MP_COOKIE 是否有效";

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

export function getMpHotspotConfigStatus() {
  return {
    source: MP_HOTSPOT_SOURCE,
    hasCookie: Boolean(getMpCookie()),
    lastLog: getLatestFetchLog(),
  };
}
