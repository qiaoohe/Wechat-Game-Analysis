import type { Metadata } from "next";

import { PAGE_DESCRIPTIONS } from "@/lib/constants";

/** 站点品牌名（浏览器标题、Open Graph 等） */
export const SITE_NAME = "微信小游戏排行榜";

/** 线上域名（Vercel 当前将 momorank.com 308 到 www.momorank.com） */
export const SITE_DOMAIN = "www.momorank.com";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  `https://${SITE_DOMAIN}`;

/** 首页与默认 meta description */
export const SITE_DESCRIPTION =
  "微信小游戏畅销榜、人气榜、畅玩榜每日更新，提供排名趋势、增速监测、热搜词与 IP 热度分析，数据与微信官方口径一致。";

export const SEO_PAGE_COPY = {
  home: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    path: "/",
  },
  rankings: {
    title: "小游戏榜单",
    description: `${PAGE_DESCRIPTIONS.rankings} 查询微信小游戏畅销榜、人气榜、畅玩榜完整排名与历史数据。`,
    path: "/rankings",
  },
  rising: {
    title: "增速榜",
    description: `${PAGE_DESCRIPTIONS.rising} 发现微信小游戏中排名快速上升的热门游戏。`,
    path: "/rising",
  },
  hotWords: {
    title: "热搜词",
    description: `${PAGE_DESCRIPTIONS.hotWords} 了解微信小游戏用户当前搜索热词与趋势变化。`,
    path: "/insights/hot-words",
  },
  hotSearch: {
    title: "热搜访问",
    description: `${PAGE_DESCRIPTIONS.hotSearch} 查看热搜词关联的小游戏访问热度排行。`,
    path: "/insights/hot-search",
  },
  ipTrends: {
    title: "IP 热度趋势",
    description: `${PAGE_DESCRIPTIONS.ipTrends} 追踪微信小游戏合作 IP 的热度变化与行业趋势。`,
    path: "/insights/ip-trends",
  },
} as const;

const KEYWORDS = [
  "微信小游戏",
  "小游戏排行榜",
  "畅销榜",
  "人气榜",
  "畅玩榜",
  "微信游戏榜单",
  "momorank",
];

interface CreatePageMetadataOptions {
  /** 页面标题片段，首页留空则使用 SITE_NAME */
  title?: string;
  description: string;
  path?: string;
  noIndex?: boolean;
  keywords?: string[];
}

function buildCanonicalUrl(path = "") {
  if (!path || path === "/") {
    return SITE_URL;
  }
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function buildDocumentTitle(title?: string) {
  if (!title || title === SITE_NAME) {
    return SITE_NAME;
  }
  return `${title} | ${SITE_NAME}`;
}

/** 生成符合 Next.js Metadata 规范的页面 SEO 配置 */
export function createPageMetadata({
  title,
  description,
  path = "",
  noIndex = false,
  keywords = KEYWORDS,
}: CreatePageMetadataOptions): Metadata {
  const canonical = buildCanonicalUrl(path);
  const documentTitle = buildDocumentTitle(title);
  const isHome = !title || title === SITE_NAME;

  return {
    title: isHome ? { absolute: SITE_NAME } : title,
    description,
    keywords,
    alternates: {
      canonical,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: "zh_CN",
      url: canonical,
      siteName: SITE_NAME,
      title: documentTitle,
      description,
    },
    twitter: {
      card: "summary",
      title: documentTitle,
      description,
    },
  };
}

/** 根 layout 默认 metadata（title.template 供子页复用） */
export function createRootMetadata(): Metadata {
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: SITE_NAME,
      template: `%s | ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    keywords: KEYWORDS,
    applicationName: SITE_NAME,
    creator: SITE_NAME,
    publisher: SITE_NAME,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    alternates: {
      canonical: SITE_URL,
    },
    openGraph: {
      type: "website",
      locale: "zh_CN",
      url: SITE_URL,
      siteName: SITE_NAME,
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
    },
    twitter: {
      card: "summary",
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    /** 补充 /favicon.ico（Google 默认会抓）；与 app/icon.tsx 48×48 PNG 一致 */
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
        { url: "/icon", sizes: "48x48", type: "image/png" },
      ],
      shortcut: "/favicon.ico",
      apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
    },
  };
}
