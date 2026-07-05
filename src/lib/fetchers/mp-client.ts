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

export async function mpPostJson<T>(
  url: string,
  body: unknown,
  options?: { referer?: string },
): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      ...getMpHeaders(),
      ...(options?.referer ? { Referer: options.referer } : {}),
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

export function isMpSessionError(error: unknown) {
  return (
    error instanceof Error &&
    (error.message.includes("40042") ||
      error.message.includes("invalid plugin session") ||
      error.message.includes("40001") ||
      error.message.includes("API_Invalid_Credential"))
  );
}

const CHINA_TIMEZONE = "Asia/Shanghai";

const chinaYmdFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: CHINA_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** 当前北京时间日历日 YYYY-MM-DD */
export function getChinaTodayYmd(): string {
  return chinaYmdFormatter.format(new Date());
}

/** MP 统计接口要求的北京时间 00:00:00 时间戳（秒） */
export function startOfDayTimestamp(daysAgo = 0): number {
  const todayYmd = chinaYmdFormatter.format(new Date());
  const [year, month, day] = todayYmd.split("-").map(Number);
  const anchor = new Date(
    `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T12:00:00+08:00`,
  );
  anchor.setDate(anchor.getDate() - daysAgo);
  const ymd = chinaYmdFormatter.format(anchor);

  return Math.floor(new Date(`${ymd}T00:00:00+08:00`).getTime() / 1000);
}
