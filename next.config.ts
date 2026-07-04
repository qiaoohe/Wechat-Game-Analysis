import type { NextConfig } from "next";
import path from "path";

/** 页面 HTML 禁止 CDN/浏览器缓存，静态资源不受影响 */
const NO_STORE_PAGE_HEADERS = [
  {
    key: "Cache-Control",
    value: "private, no-cache, no-store, max-age=0, must-revalidate",
  },
  {
    key: "CDN-Cache-Control",
    value: "no-store",
  },
  {
    key: "Vercel-CDN-Cache-Control",
    value: "no-store",
  },
];

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
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
        headers: NO_STORE_PAGE_HEADERS,
      },
    ];
  },
};

export default nextConfig;
