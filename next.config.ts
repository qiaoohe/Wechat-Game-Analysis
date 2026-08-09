import type { NextConfig } from "next";
import path from "path";

/**
 * 页面 ISR：新鲜窗口 5 分钟（与 layout revalidate=300 一致）。
 * expireTime 控制 Next 生成的 Cache-Control 中 stale-while-revalidate：
 * swr = expireTime - revalidate → 360-300 = 60，避免默认一年的陈旧窗口。
 */
const PAGE_S_MAXAGE = 300;
const PAGE_EXPIRE = 360;

/**
 * CDN / 浏览器分流：
 * - Cache-Control：浏览器不长期缓存 HTML（max-age=0），需校验后再用
 * - CDN-*：边缘仍可短缓存，并只允许 60s 过期后先返回旧页
 */
const PAGE_CACHE_HEADERS = [
  {
    key: "Cache-Control",
    value: `public, max-age=0, must-revalidate, s-maxage=${PAGE_S_MAXAGE}, stale-while-revalidate=60`,
  },
  {
    key: "CDN-Cache-Control",
    value: `public, s-maxage=${PAGE_S_MAXAGE}, stale-while-revalidate=60`,
  },
  {
    key: "Vercel-CDN-Cache-Control",
    value: `public, s-maxage=${PAGE_S_MAXAGE}, stale-while-revalidate=60`,
  },
];

const nextConfig: NextConfig = {
  expireTime: PAGE_EXPIRE,
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
