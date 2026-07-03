import {
  DATA_SOURCE_NOTE_MP,
  DATA_SOURCE_NOTE_PUBLIC,
  type FetchSourceMode,
} from "@/lib/constants";
import type { FetchResult } from "@/lib/types";
import {
  fetchAllOfficialRanks,
  getFetchConfigStatus as getPublicFetchConfigStatus,
} from "@/lib/fetchers/wechat-official-fetcher";
import {
  fetchAllMpHotspotRanks,
  getMpHotspotConfigStatus,
} from "@/lib/fetchers/wechat-mp-hotspot-fetcher";

export type ActiveFetchSource = "mp_hotspot" | "public_web";

function hasMpCookie() {
  return Boolean(process.env.WECHAT_MP_COOKIE?.trim());
}

/** 解析当前应使用的数据源：mp_hotspot | public_web | auto（有 Cookie 用 MP） */
export function resolveFetchSource(): ActiveFetchSource {
  const mode = (process.env.FETCH_SOURCE?.trim() ??
    "auto") as FetchSourceMode | "auto";

  if (mode === "mp_hotspot") return "mp_hotspot";
  if (mode === "public_web") return "public_web";
  return hasMpCookie() ? "mp_hotspot" : "public_web";
}

export function getDataSourceNote(source = resolveFetchSource()) {
  return source === "mp_hotspot" ? DATA_SOURCE_NOTE_MP : DATA_SOURCE_NOTE_PUBLIC;
}

export async function fetchAllRanks(date?: string): Promise<FetchResult> {
  const source = resolveFetchSource();

  if (source === "mp_hotspot") {
    if (!hasMpCookie()) {
      throw new Error(
        "FETCH_SOURCE=mp_hotspot 但未配置 WECHAT_MP_COOKIE",
      );
    }
    return fetchAllMpHotspotRanks(date);
  }

  return fetchAllOfficialRanks(date);
}

export async function getFetchConfigStatus() {
  const source = resolveFetchSource();
  const mp = getMpHotspotConfigStatus();
  const pub = await getPublicFetchConfigStatus();

  return {
    source,
    dataSourceNote: getDataSourceNote(source),
    mpHotspot: mp,
    publicWeb: pub,
    hasMpCookie: mp.hasCookie,
    lastLog: mp.lastLog ?? pub.lastLog,
  };
}
