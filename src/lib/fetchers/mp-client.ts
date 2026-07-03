export const MP_REFERER =
  "https://gamemp.weixin.qq.com/minigame/minigame/minigame_abilitymap/main";

export function getMpCookie() {
  return process.env.WECHAT_MP_COOKIE?.trim() ?? "";
}

export function requireMpCookie() {
  const cookie = getMpCookie();
  if (!cookie) {
    throw new Error("未配置 WECHAT_MP_COOKIE，无法访问 MP 热点创意工具数据");
  }
  return cookie;
}

export function getMpHeaders(cookie = requireMpCookie()) {
  return {
    Cookie: cookie,
    Accept: "application/json, text/plain, */*",
    Referer: MP_REFERER,
    Origin: "https://gamemp.weixin.qq.com",
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  };
}

export async function mpGetJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: getMpHeaders(),
    cache: "no-store",
  });
  const text = await response.text();
  let json: T & { errcode?: number; errmsg?: string };
  try {
    json = JSON.parse(text) as T & { errcode?: number; errmsg?: string };
  } catch {
    throw new Error(
      `MP 接口返回非 JSON（HTTP ${response.status}），Cookie 可能已失效`,
    );
  }
  if (json.errcode !== undefined && json.errcode !== 0) {
    throw new Error(
      json.errmsg
        ? `MP 接口错误 ${json.errcode}: ${json.errmsg}`
        : `MP 接口错误 ${json.errcode}`,
    );
  }
  return json;
}

export async function mpPostJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      ...getMpHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const text = await response.text();
  let json: T & { errcode?: number; errmsg?: string };
  try {
    json = JSON.parse(text) as T & { errcode?: number; errmsg?: string };
  } catch {
    throw new Error(
      `MP 接口返回非 JSON（HTTP ${response.status}），Cookie 可能已失效`,
    );
  }
  if (json.errcode !== undefined && json.errcode !== 0) {
    throw new Error(
      json.errmsg
        ? `MP 接口错误 ${json.errcode}: ${json.errmsg}`
        : `MP 接口错误 ${json.errcode}`,
    );
  }
  return json;
}

export function startOfDayTimestamp(daysAgo = 0) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(0, 0, 0, 0);
  return Math.floor(date.getTime() / 1000);
}
