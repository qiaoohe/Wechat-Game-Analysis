import type { NextConfig } from "next";
import path from "path";

/**
 * 页面 ISR / CDN：新鲜窗口 5 分钟。
 * stale-while-revalidate 只留 60 秒，避免长时间先返回旧页再后台刷新
 * （抓取成功后还会走 /api/revalidate 主动失效）。
 */
const PAGE_CACHE_HEADERS = [
  {
    key: "Cache-Control",
    value: "public, s-maxage=300, stale-while-revalidate=60",
  },
  {
    key: "CDN-Cache-Control",
    value: "public, s-maxage=300, stale-while-revalidate=60",
  },
  {
    key: "Vercel-CDN-Cache-Control",
    value: "public, s-maxage=300, stale-while-revalidate=60",
  },
];

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  images: {
    localPatterns: [
      {
        pathname: "/api/proxy/image",
      },
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
      {
        protocol: "https",
        hostname: "mmbiz.qpic.cn",
      },
      {
        protocol: "https",
        hostname: "mmgame.qpic.cn",
      },
      {
        protocol: "https",
        hostname: "mmocgame.qpic.cn",
      },
      {
        protocol: "https",
        hostname: "wx.qlogo.cn",
      },
      {
        protocol: "https",
        hostname: "thirdwx.qlogo.cn",
      },
    ],
  },
  turbopack: {
    root: path.join(__dirname),
  },
  async headers() {
    return [
      {
        source:
          "/((?!_next/static|_next/image|favicon.ico|icon.svg|robots.txt|sitemap.xml|api/proxy).*)",
        headers: PAGE_CACHE_HEADERS,
      },
    ];
  },
};

export default nextConfig;
