import {
  getMpCookie,
  isMpSessionError,
  mpPostJson,
  startOfDayTimestamp,
} from "@/lib/fetchers/mp-client";
import {
  getLatestInsightSnapshot,
  saveInsightSnapshot,
} from "@/lib/services/insight-service";
import type {
  HotSearchVisitItem,
  HotWordItem,
  IpTrendItem,
  IpTrendsCacheItem,
} from "@/lib/types";
import { normalizeIconUrl } from "@/lib/utils/icon";

const STAT_API =
  "https://gamemp.weixin.qq.com/cgi-bin/gamewxagbdatawap/getwxagstatmp";

const IP_LIST_API =
  "https://gamemp.weixin.qq.com/cgi-bin/gamewxagcirclemanageweb/cfcommcgi/spacexgamemp_ipcooperate_getipcooperatelist";

const IP_LIBRARY_REFERER =
  "https://gamemp.weixin.qq.com/minigame/minigame/minigame_ip/ip_cooperation_library";

const IP_LIST_PAGE_SIZE = 20;
const IP_TRENDS_DISPLAY_PAGE_SIZE = 50;

interface MpStatRow {
  time_label?: string;
  key_field_list?: Array<{ value?: string; label?: string }>;
  point_list?: Array<{ value?: number }>;
}

interface MpStatResponse {
  data?: {
    table_data_list?: Array<{ row_list?: MpStatRow[] }>;
  };
}

interface MpIpItem extends IpTrendsCacheItem {}

interface MpIpListResponse {
  data?: {
    list?: MpIpItem[];
    total_count?: number;
  };
}

export type IpTrendSortType = 3 | 4;

export const IP_TREND_SORT_LABELS: Record<IpTrendSortType, string> = {
  4: "上升最快",
  3: "行业最热",
};

function buildStatBody(statType: number, keyFieldIds: number[], dataFieldId: number, daysAgo: number) {
  return {
    sequence_index_list: [],
    group_index_list: [],
    rank_index_list: [],
    table_index_list: [
      {
        size_type: 24,
        time_period: {
          start_time: startOfDayTimestamp(daysAgo),
          duration_seconds: 86400,
        },
        index_list: [
          {
            stat_type: statType,
            filter_list: [],
            key_field_id_list: keyFieldIds,
            data_field_id: dataFieldId,
          },
        ],
        keep_origin_order: true,
      },
    ],
    sum_point_index_list: [],
    is_indep_error_policy_enabled: false,
    stat_page: "mp_hot_word_page",
  };
}

function hasHotWordRows(rows: MpStatRow[]) {
  const first = rows[0]?.key_field_list;
  return Boolean(
    first?.[0]?.value && first?.[1]?.value && first?.[2]?.value,
  );
}

function hasHotSearchRows(rows: MpStatRow[]) {
  const first = rows[0]?.key_field_list;
  return Boolean(first?.[0]?.value && first?.[1]?.value);
}

function isMpTimeRangeError(error: unknown) {
  return (
    error instanceof Error &&
    (error.message.includes("-10016005") ||
      error.message.includes("时间范围填写错误"))
  );
}

async function fetchStatRows(
  statType: number,
  keyFieldIds: number[],
  dataFieldId: number,
  validate: (rows: MpStatRow[]) => boolean,
  maxDaysBack = 7,
) {
  // 优先取当日；若 MP 仍返回占位行则回退到 T-1、T-2…
  for (let daysAgo = 0; daysAgo <= maxDaysBack; daysAgo++) {
    const body = buildStatBody(statType, keyFieldIds, dataFieldId, daysAgo);
    try {
      const json = await mpPostJson<MpStatResponse>(STAT_API, body);
      const rows = json.data?.table_data_list?.[0]?.row_list ?? [];
      if (rows.length > 0 && validate(rows)) {
        return {
          date: rows[0]?.time_label ?? "",
          rows,
        };
      }
    } catch (error) {
      if (isMpTimeRangeError(error)) {
        continue;
      }
      throw error;
    }
  }
  return { date: "", rows: [] as MpStatRow[] };
}

async function fetchHotWordsFromMp() {
  const { date, rows } = await fetchStatRows(
    1000402,
    [10, 11, 12],
    9,
    hasHotWordRows,
  );

  const items = rows
    .map((row, index) => {
      const fields = row.key_field_list ?? [];
      const name = fields[2]?.value?.trim();
      if (!name) return null;
      return {
        rank: row.point_list?.[0]?.value ?? index + 1,
        name,
        isNew: fields[0]?.value === "1",
        isUp: fields[1]?.value === "1",
      };
    })
    .filter((item): item is HotWordItem => item !== null);

  return { date, items };
}

async function fetchHotSearchFromMp() {
  const { date, rows } = await fetchStatRows(
    1000403,
    [14, 16, 17, 18],
    13,
    hasHotSearchRows,
  );

  const items = rows
    .map((row, index) => {
      const fields = row.key_field_list ?? [];
      const appId = fields[0]?.value?.trim();
      const name = fields[0]?.label?.trim();
      if (!appId || !name) return null;
      return {
        rank: row.point_list?.[0]?.value ?? index + 1,
        appId,
        name,
        iconUrl: normalizeIconUrl(fields[2]?.label) ?? undefined,
        description: fields[3]?.label?.trim() || undefined,
      };
    })
    .filter((item) => item !== null) as HotSearchVisitItem[];

  return { date, items };
}

export type InsightDataSource = "live" | "cache";

export async function fetchHotWords(): Promise<{
  date: string;
  items: HotWordItem[];
  source: InsightDataSource;
  fetchedAt: string;
}> {
  if (getMpCookie()) {
    try {
      const live = await fetchHotWordsFromMp();
      if (live.items.length > 0) {
        const fetchedAt = new Date().toISOString();
        await saveInsightSnapshot("hot_words", live.date, live.items);
        return { ...live, source: "live", fetchedAt };
      }
    } catch (error) {
      if (!isMpSessionError(error)) {
        throw error;
      }
    }
  }

  const cached = await getLatestInsightSnapshot("hot_words");
  if (cached) {
    return {
      date: cached.dataDate,
      items: cached.items,
      source: "cache",
      fetchedAt: cached.fetchedAt,
    };
  }

  throw new Error(
    getMpCookie()
      ? "MP Cookie 已失效且暂无缓存数据，请更新 WECHAT_MP_COOKIE 后重新抓取"
      : "未配置 WECHAT_MP_COOKIE，且暂无缓存数据",
  );
}

export async function fetchHotSearchVisits(): Promise<{
  date: string;
  items: HotSearchVisitItem[];
  source: InsightDataSource;
  fetchedAt: string;
}> {
  if (getMpCookie()) {
    try {
      const live = await fetchHotSearchFromMp();
      if (live.items.length > 0) {
        const fetchedAt = new Date().toISOString();
        await saveInsightSnapshot("hot_search", live.date, live.items);
        return { ...live, source: "live", fetchedAt };
      }
    } catch (error) {
      if (!isMpSessionError(error)) {
        throw error;
      }
    }
  }

  const cached = await getLatestInsightSnapshot("hot_search");
  if (cached) {
    return {
      date: cached.dataDate,
      items: cached.items,
      source: "cache",
      fetchedAt: cached.fetchedAt,
    };
  }

  throw new Error(
    getMpCookie()
      ? "MP Cookie 已失效且暂无缓存数据，请更新 WECHAT_MP_COOKIE 后重新抓取"
      : "未配置 WECHAT_MP_COOKIE，且暂无缓存数据",
  );
}

export interface InsightFetchResult {
  hotWords: { count: number; date: string; error?: string };
  hotSearch: { count: number; date: string; error?: string };
  ipTrends: { count: number; date: string; error?: string };
}

/** Cron 抓取：从 MP 拉取热搜词/热搜访问/IP 热度并写入数据库 */
export async function fetchAndPersistInsights(): Promise<InsightFetchResult> {
  const result: InsightFetchResult = {
    hotWords: { count: 0, date: "" },
    hotSearch: { count: 0, date: "" },
    ipTrends: { count: 0, date: "" },
  };

  if (!getMpCookie()) {
    const message = "未配置 WECHAT_MP_COOKIE";
    result.hotWords.error = message;
    result.hotSearch.error = message;
    result.ipTrends.error = message;
    return result;
  }

  try {
    const live = await fetchHotWordsFromMp();
    if (live.items.length > 0) {
      await saveInsightSnapshot("hot_words", live.date, live.items);
      result.hotWords = { count: live.items.length, date: live.date };
    } else {
      result.hotWords.error = "暂无热搜词数据";
    }
  } catch (error) {
    result.hotWords.error =
      error instanceof Error ? error.message : "热搜词抓取失败";
  }

  try {
    const live = await fetchHotSearchFromMp();
    if (live.items.length > 0) {
      await saveInsightSnapshot("hot_search", live.date, live.items);
      result.hotSearch = { count: live.items.length, date: live.date };
    } else {
      result.hotSearch.error = "暂无热搜访问数据";
    }
  } catch (error) {
    result.hotSearch.error =
      error instanceof Error ? error.message : "热搜访问抓取失败";
  }

  try {
    const { list } = await fetchAllIpRawItemsUncached();
    if (list.length > 0) {
      const dataDate = resolveIpDataDate(list);
      await saveInsightSnapshot("ip_trends", dataDate, list);
      result.ipTrends = { count: list.length, date: dataDate };
    } else {
      result.ipTrends.error = "暂无 IP 热度数据";
    }
  } catch (error) {
    result.ipTrends.error =
      error instanceof Error ? error.message : "IP 热度抓取失败";
  }

  return result;
}

function formatWxIndex(value: number) {
  if (value >= 100_000_000) {
    return `约 ${Math.round(value / 100_000_000)} 亿`;
  }
  if (value >= 10_000) {
    return `约 ${Math.round(value / 10_000)} 万`;
  }
  return value.toLocaleString("zh-CN");
}

function mapIpItem(item: MpIpItem, rank: number): IpTrendItem {
  return {
    rank,
    id: item.id ?? rank,
    name: item.ip_name?.trim() ?? "未知 IP",
    description: item.ip_desc?.trim() || undefined,
    iconUrl: normalizeIconUrl(item.ip_icon),
    wxIndex: item.wxindex ?? 0,
    wxIndexLabel: formatWxIndex(item.wxindex ?? 0),
    wxIndexChange: item.wxindex_change ?? 0,
    tags: item.style_list
      ? item.style_list.split(",").map((tag) => tag.trim()).filter(Boolean)
      : [],
    updatedAt: item.wxindex_time?.trim() || undefined,
  };
}

function sortIpItems(items: MpIpItem[], orderType: IpTrendSortType) {
  const sorted = [...items];
  if (orderType === 4) {
    sorted.sort(
      (a, b) => (b.wxindex_change ?? 0) - (a.wxindex_change ?? 0),
    );
    return sorted;
  }
  sorted.sort((a, b) => (b.wxindex ?? 0) - (a.wxindex ?? 0));
  return sorted;
}

async function fetchAllIpRawItemsUncached(): Promise<{
  list: MpIpItem[];
  totalCount: number;
}> {
  const first = await mpPostJson<MpIpListResponse>(
    IP_LIST_API,
    { order_type: 1, cur_page: 0, per_page: IP_LIST_PAGE_SIZE },
    { referer: IP_LIBRARY_REFERER },
  );
  const totalCount = first.data?.total_count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / IP_LIST_PAGE_SIZE));

  const pageResults = await Promise.all(
    Array.from({ length: totalPages }, (_, curPage) =>
      curPage === 0
        ? Promise.resolve(first)
        : mpPostJson<MpIpListResponse>(
            IP_LIST_API,
            {
              order_type: 1,
              cur_page: curPage,
              per_page: IP_LIST_PAGE_SIZE,
            },
            { referer: IP_LIBRARY_REFERER },
          ),
    ),
  );

  const seen = new Set<number>();
  const list: MpIpItem[] = [];
  for (const json of pageResults) {
    for (const item of json.data?.list ?? []) {
      if (!item.wxindex || item.wxindex <= 0 || item.id == null) {
        continue;
      }
      if (seen.has(item.id)) {
        continue;
      }
      seen.add(item.id);
      list.push(item);
    }
  }

  return { list, totalCount };
}

function resolveIpDataDate(items: MpIpItem[]): string {
  let latest = "";
  for (const item of items) {
    const date = item.wxindex_time?.slice(0, 10);
    if (date && date > latest) {
      latest = date;
    }
  }
  return latest;
}

function paginateIpTrends(
  list: MpIpItem[],
  orderType: IpTrendSortType,
  page: number,
  pageSize: number,
  totalCountHint?: number,
) {
  const sorted = sortIpItems(list, orderType);
  const safePage = Math.min(
    Math.max(1, page),
    Math.max(1, Math.ceil(sorted.length / pageSize)),
  );
  const start = (safePage - 1) * pageSize;
  const slice = sorted.slice(start, start + pageSize);
  const items = slice.map((item, index) => mapIpItem(item, start + index + 1));

  return {
    items,
    totalCount: sorted.length || totalCountHint || 0,
    page: safePage,
    pageSize,
    totalPages: Math.max(1, Math.ceil(sorted.length / pageSize)),
    dataDate: resolveIpDataDate(sorted),
  };
}

export async function fetchIpTrends(
  orderType: IpTrendSortType = 4,
  page = 1,
  pageSize = IP_TRENDS_DISPLAY_PAGE_SIZE,
): Promise<{
  items: IpTrendItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  dataDate: string;
  source: InsightDataSource;
  fetchedAt: string;
}> {
  if (getMpCookie()) {
    try {
      const { list, totalCount } = await fetchAllIpRawItemsUncached();
      if (list.length > 0) {
        const fetchedAt = new Date().toISOString();
        const dataDate = resolveIpDataDate(list);
        await saveInsightSnapshot("ip_trends", dataDate, list);
        return {
          ...paginateIpTrends(list, orderType, page, pageSize, totalCount),
          source: "live",
          fetchedAt,
        };
      }
    } catch (error) {
      if (!isMpSessionError(error)) {
        throw error;
      }
    }
  }

  const cached = await getLatestInsightSnapshot("ip_trends");
  if (cached) {
    return {
      ...paginateIpTrends(
        cached.items as MpIpItem[],
        orderType,
        page,
        pageSize,
      ),
      source: "cache",
      fetchedAt: cached.fetchedAt,
    };
  }

  throw new Error(
    getMpCookie()
      ? "MP Cookie 已失效且暂无缓存数据，请更新 WECHAT_MP_COOKIE 后重新抓取"
      : "未配置 WECHAT_MP_COOKIE，且暂无 IP 热度缓存数据",
  );
}
