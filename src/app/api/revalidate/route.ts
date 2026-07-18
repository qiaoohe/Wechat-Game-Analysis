import { NextResponse } from "next/server";

import { revalidateSitePages } from "@/lib/cache/revalidate-site";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

/** 抓取数据后按需失效页面缓存，避免首次打开仍是旧 ISR 页 */
export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  try {
    const paths = revalidateSitePages();
    return NextResponse.json({
      success: true,
      revalidated: true,
      paths,
      at: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "缓存失效失败",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  return POST(request);
}
