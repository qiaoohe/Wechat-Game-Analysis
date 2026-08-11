export type SitePlatform = "wechat" | "douyin";

export interface NavItem {
  href: string;
  label: string;
  description: string;
}

/** 微信平台主导航 */
export const WECHAT_NAV_ITEMS: readonly NavItem[] = [
  { href: "/", label: "概览", description: "数据概览与畅销榜 Top 10" },
  {
    href: "/rankings",
    label: "榜单",
    description: "微信小游戏畅销榜 · 人气榜 · 畅玩榜",
  },
  { href: "/rising", label: "增速", description: "排名快速上升的游戏" },
  {
    href: "/insights/hot-words",
    label: "热搜词",
    description: "用户搜索热词趋势",
  },
  {
    href: "/insights/hot-search",
    label: "热搜访问",
    description: "热搜词关联游戏访问",
  },
  {
    href: "/insights/ip-trends",
    label: "IP 热度",
    description: "合作 IP 热度趋势",
  },
] as const;

/** 抖音平台主导航（仅展示已上线能力） */
export const DOUYIN_NAV_ITEMS: readonly NavItem[] = [
  { href: "/douyin", label: "概览", description: "数据概览与热门榜 Top 10" },
  {
    href: "/douyin/rankings",
    label: "榜单",
    description: "热门榜 · 畅销榜 · 新游榜 · 发行人热度榜",
  },
  {
    href: "/douyin/rising",
    label: "增速",
    description: "排名快速上升的抖音小游戏",
  },
] as const;

/** Logo 旁平台切换：真实链接，利于 SEO 发现 /douyin/* */
export const PLATFORM_SWITCH_ITEMS = [
  {
    id: "wechat" as const,
    label: "微信",
    href: "/",
  },
  {
    id: "douyin" as const,
    label: "抖音",
    href: "/douyin",
  },
] as const;

export function getSitePlatform(pathname: string): SitePlatform {
  return pathname.startsWith("/douyin") ? "douyin" : "wechat";
}

export function getNavItems(platform: SitePlatform): readonly NavItem[] {
  return platform === "douyin" ? DOUYIN_NAV_ITEMS : WECHAT_NAV_ITEMS;
}

export function getPlatformHomeHref(platform: SitePlatform): string {
  return platform === "douyin" ? "/douyin" : "/";
}

export function isNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/douyin") return pathname === "/douyin";
  // 抖音游戏详情归属「榜单」高亮
  if (href === "/douyin/rankings") {
    return (
      pathname.startsWith("/douyin/rankings") ||
      pathname.startsWith("/douyin/games")
    );
  }
  return pathname.startsWith(href);
}
