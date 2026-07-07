import type { NextConfig } from "next";
import path from "path";

/** 页面 ISR 缓存：数据日更，CDN 缓存 5 分钟，过期后后台刷新 */
const PAGE_CACHE_HEADERS = [
  {
    key: "Cache-Control",
    value: "public, s-maxage=300, stale-while-revalidate=86400",
  },
  {
    key: "CDN-Cache-Control",
    value: "public, s-maxage=300, stale-while-revalidate=86400",
  },
  {
    key: "Vercel-CDN-Cache-Control",
    value: "public, s-maxage=300, stale-while-revalidate=86400",
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
