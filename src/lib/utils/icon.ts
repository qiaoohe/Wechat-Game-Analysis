import {
  ALLOWED_ICON_HOSTS,
  DOUYIN_DIRECT_ICON_HOSTS,
} from "@/lib/constants";

export function getGameIconFallback(name: string) {
  return `https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(name)}&backgroundColor=e04d4e,f5caca,fff5f5`;
}

function hostnameMatches(hostname: string, allowedHosts: readonly string[]) {
  return allowedHosts.some(
    (host) => hostname === host || hostname.endsWith(`.${host}`),
  );
}

export function isAllowedIconUrl(url: string) {
  try {
    const parsed = new URL(url);
    return hostnameMatches(parsed.hostname, ALLOWED_ICON_HOSTS);
  } catch {
    return false;
  }
}

/** 抖音 CDN 可浏览器直连，无需经 /api/proxy/image */
export function isDouyinDirectIconUrl(url: string) {
  try {
    const parsed = new URL(url);
    return hostnameMatches(parsed.hostname, DOUYIN_DIRECT_ICON_HOSTS);
  } catch {
    return false;
  }
}

export function resolveGameIconUrl(
  iconUrl: string | null | undefined,
  name: string,
) {
  if (iconUrl) {
    if (isDouyinDirectIconUrl(iconUrl)) {
      return iconUrl;
    }
    return `/api/proxy/image?url=${encodeURIComponent(iconUrl)}`;
  }
  return getGameIconFallback(name);
}

export function normalizeIconUrl(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const url = value.startsWith("http") ? value : `https:${value}`;
  return isAllowedIconUrl(url) ? url : undefined;
}

export function pickString(obj: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

export function pickNumber(obj: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "number" && !Number.isNaN(value)) return value;
    if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return undefined;
}
