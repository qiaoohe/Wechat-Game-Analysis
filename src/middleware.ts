import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { GOOGLE_TAG_HEAD_SNIPPET } from "@/lib/analytics/google-tag";

const SKIP_HEADER = "x-gtag-inject-skip";

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon.svg|robots.txt|sitemap.xml).*)",
  ],
};

/** 将 Google 官方 gtag 片段原样插入 <head> 起始处（GA 安装检测只认标准 HTML） */
export async function middleware(request: NextRequest) {
  if (request.headers.get(SKIP_HEADER) === "1") {
    return NextResponse.next();
  }

  const headers = new Headers(request.headers);
  headers.set(SKIP_HEADER, "1");

  const response = await fetch(
    new Request(request.url, {
      method: request.method,
      headers,
      body:
        request.method !== "GET" && request.method !== "HEAD"
          ? request.body
          : undefined,
    }),
  );

  const contentType = response.headers.get("content-type") ?? "";
  if (response.status !== 200 || !contentType.includes("text/html")) {
    return response;
  }

  const html = await response.text();
  if (!/<head[^>]*>/i.test(html) || html.includes(GOOGLE_TAG_HEAD_SNIPPET)) {
    return response;
  }

  const updated = html.replace(
    /<head([^>]*)>/i,
    `<head$1>${GOOGLE_TAG_HEAD_SNIPPET}`,
  );

  const outHeaders = new Headers(response.headers);
  outHeaders.delete("content-length");
  outHeaders.delete("content-encoding");

  return new Response(updated, {
    status: response.status,
    headers: outHeaders,
  });
}
