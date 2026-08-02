import { PUBLIC_RANK_SOURCE } from "@/lib/constants";
import { extractEmbeddedJson } from "@/lib/utils/html-embedded-json";

const FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml",
  "Accept-Language": "zh-CN,zh;q=0.9",
};

interface OfficialGameDetailData {
  getgamedetail?: {
    data?: {
      wxag_item?: {
        base_info?: {
          appid?: string;
          appname?: string;
          developer?: string;
          operator?: string;
          intro?: string;
          brief_intro?: string;
        };
      };
    };
  };
}

export interface OfficialGameCompanyInfo {
  appId: string;
  developer: string | null;
  operator: string | null;
  /** 优先 developer，其次 operator */
  publisher: string | null;
}

function normalizeCompany(value?: string | null): string | null {
  const text = value?.trim();
  if (!text) return null;
  if (text === "-" || text === "—" || text === "暂无" || text === "未知") {
    return null;
  }
  return text;
}

function parsePublisherFromMeta(html: string): string | null {
  const match = html.match(
    /<meta\s+name="description"\s+content="([^"]*)"/i,
  );
  if (!match?.[1]) return null;
  const fromPhrase = match[1].match(/由([^，,]{2,80}?)开发/);
  return normalizeCompany(fromPhrase?.[1] ?? null);
}

/** 从微信小游戏官网详情页抓取开发商 / 运营商 */
export async function fetchOfficialGameCompany(
  appId: string,
): Promise<OfficialGameCompanyInfo> {
  const id = appId.trim();
  if (!id) {
    throw new Error("appId 为空");
  }

  const url = `${PUBLIC_RANK_SOURCE}/detail/${encodeURIComponent(id)}.html`;
  const response = await fetch(url, {
    headers: FETCH_HEADERS,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`详情页请求失败 (${response.status}): ${url}`);
  }

  const html = await response.text();
  const detail = extractEmbeddedJson<OfficialGameDetailData>(
    html,
    "__DETAIL_DATA__",
  );
  const base = detail?.getgamedetail?.data?.wxag_item?.base_info;

  const developer = normalizeCompany(base?.developer);
  const operator = normalizeCompany(base?.operator);
  const publisher =
    developer || operator || parsePublisherFromMeta(html);

  return {
    appId: id,
    developer,
    operator,
    publisher,
  };
}
