import { NextResponse } from "next/server";

import { isAllowedIconUrl, isDouyinDirectIconUrl } from "@/lib/utils/icon";

function refererForIconUrl(url: string) {
  if (isDouyinDirectIconUrl(url)) {
    return "https://developer.open-douyin.com/";
  }
  return "https://servicewechat.com/";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "缺少 url 参数" }, { status: 400 });
  }

  if (!isAllowedIconUrl(url)) {
    return NextResponse.json(
      { error: "不允许的图片域名" },
      {
        status: 403,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }

  try {
    const response = await fetch(url, {
      headers: {
        Referer: refererForIconUrl(url),
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
      cache: "force-cache",
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "图片获取失败" },
        {
          status: 502,
          headers: { "Cache-Control": "no-store" },
        },
      );
    }

    const contentType = response.headers.get("content-type") ?? "image/png";
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "图片代理失败" },
      {
        status: 500,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
