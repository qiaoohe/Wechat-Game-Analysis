import type { NextRequest } from "next/server";

import { GOOGLE_TAG_HEAD_SNIPPET } from "@/lib/analytics/google-tag";

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon.svg|robots.txt|sitemap.xml).*)",
  ],
};

/**
 * Google 要求 gtag 紧接在 <head> 之后；Next.js 默认会把 script 排在内部 chunk 后面。
 * 在 Edge Middleware 里把官方片段插入 <head> 起始位置，供 Google 安装检测识别。
 */
export async function middleware(request: NextRequest) {
  const response = await fetch(request);

  const contentType = response.headers.get("content-type") ?? "";
  if (response.status !== 200 || !contentType.includes("text/html")) {
    return response;
  }

  const html = await response.text();
  if (!/<head[^>]*>/i.test(html)) {
    return response;
  }

  const updated = html.replace(
    /<head([^>]*)>/i,
    `<head$1>${GOOGLE_TAG_HEAD_SNIPPET}`,
  );

  const headers = new Headers(response.headers);
  headers.delete("content-length");
  headers.delete("content-encoding");

  return new Response(updated, {
    status: response.status,
    headers,
  });
}
