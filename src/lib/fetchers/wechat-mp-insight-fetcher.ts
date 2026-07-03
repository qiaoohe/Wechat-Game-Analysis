import {
  mpGetJson,
  mpPostJson,
  startOfDayTimestamp,
} from "@/lib/fetchers/mp-client";
import type {
  HotSearchVisitItem,
  HotWordItem,
  IpTrendItem,
} from "@/lib/types";
import { normalizeIconUrl } from "@/lib/utils/icon";

const STAT_API =
  "https://gamemp.weixin.qq.com/cgi-bin/gamewxagbdatawap/getwxagstatmp";

const IP_LIST_API =
  "https://gamemp.weixin.qq.com/cgi-bin/gamewxagcirclemanageweb/cfcommcgi/spacexgamemp_ipcooperate_getipcooperatelist";

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

interface MpIpItem {
  id?: number;
  ip_name?: string;
  ip_desc?: string;
  ip_icon?: string;
  wxindex?: number;
  wxindex_change?: number;
  style_list?: string;
  wxindex_time?: string;
}

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

async function fetchStatRows(
  statType: number,
  keyFieldIds: number[],
  dataFieldId: number,
  validate: (rows: MpStatRow[]) => boolean,
  maxDaysBack = 7,
) {
  for (let daysAgo = 1; daysAgo <= maxDaysBack; daysAgo++) {
    const body = buildStatBody(statType, keyFieldIds, dataFieldId, daysAgo);
    const json = await mpPostJson<MpStatResponse>(STAT_API, body);
    const rows = json.data?.table_data_list?.[0]?.row_list ?? [];
    if (rows.length > 0 && validate(rows)) {
      return {
        date: rows[0]?.time_label ?? "",
        rows,
      };
    }
  }
  return { date: "", rows: [] as MpStatRow[] };
}

export async function fetchHotWords(): Promise<{
  date: string;
  items: HotWordItem[];
}> {
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

export async function fetchHotSearchVisits(): Promise<{
  date: string;
  items: HotSearchVisitItem[];
}> {
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

function formatWxIndex(value: number) {
  if (value >= 100_000_000) {
    return `约 ${Math.round(value / 100_000_000)} 亿`;
  }
  if (value >= 10_000) {
    return `约 ${Math.round(value / 10_000)} 万`;
  }
  return value.toLocaleString("zh-CN");
}

export async function fetchIpTrends(
  orderType: IpTrendSortType = 4,
  perPage = 50,
): Promise<{ items: IpTrendItem[]; totalCount: number }> {
  const url = `${IP_LIST_API}?order_type=${orderType}&cur_page=0&per_page=${perPage}`;
  const json = await mpGetJson<MpIpListResponse>(url);
  const list = json.data?.list ?? [];

  const items = list
    .filter((item) => item.wxindex && item.wxindex > 0)
    .map((item, index) => ({
      rank: index + 1,
      id: item.id ?? index,
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
    }));

  return {
    items,
    totalCount: json.data?.total_count ?? items.length,
  };
}
