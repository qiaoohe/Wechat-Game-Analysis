import { NextResponse } from "next/server";

import {
  fetchAllRanks,
  getFetchConfigStatus,
} from "@/lib/fetchers/rank-fetcher";
import { fetchAndPersistInsights } from "@/lib/fetchers/wechat-mp-insight-fetcher";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

async function runFetch(date?: string) {
  const result = await fetchAllRanks(date);
  const insights = await fetchAndPersistInsights();
  const insightOk =
    insights.hotWords.count > 0 || insights.hotSearch.count > 0;
  const success = result.success || insightOk;

  return NextResponse.json(
    { ...result, insights, success },
    { status: success ? 200 : 502 },
  );
}

/** 查看状态；Vercel Cron 带授权 GET 时自动抓取；本地可用 ?trigger=1 */
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? undefined;
  const shouldFetch =
    searchParams.get("trigger") === "1" || Boolean(process.env.CRON_SECRET);

  if (shouldFetch) {
    try {
      return await runFetch(date);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: error instanceof Error ? error.message : "抓取失败",
        },
        { status: 500 },
      );
    }
  }

  return NextResponse.json(await getFetchConfigStatus());
}

/** 手动或外部 cron POST 触发抓取 */
export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  try {
    const body = request.headers.get("content-type")?.includes("json")
      ? await request.json().catch(() => ({}))
      : {};
    const date = typeof body.date === "string" ? body.date : undefined;
    return await runFetch(date);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "抓取失败",
      },
      { status: 500 },
    );
  }
}
