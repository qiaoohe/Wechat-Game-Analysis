import { NextResponse } from "next/server";

import {
  searchGames,
  type SearchPlatform,
} from "@/lib/services/rank-service";
import { PUBLISHER_UNAVAILABLE } from "@/lib/services/publisher-service";

function resolvePlatform(value: string | null): SearchPlatform {
  return value === "douyin" ? "douyin" : "wechat";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const platform = resolvePlatform(searchParams.get("platform"));
  const limitRaw = Number(searchParams.get("limit") ?? "8");
  const limit =
    Number.isFinite(limitRaw) && limitRaw > 0
      ? Math.min(Math.floor(limitRaw), 20)
      : 8;

  if (q.length < 1) {
    return NextResponse.json({ query: q, platform, items: [] });
  }

  const rows = await searchGames(q, limit, platform);
  const items = rows.map(
    (row: {
      id: number;
      name: string;
      appId: string | null;
      iconUrl: string | null;
      category: string | null;
      publisher: string | null;
    }) => ({
      id: row.id,
      name: row.name,
      appId: row.appId,
      iconUrl: row.iconUrl,
      category: row.category,
      publisher:
        row.publisher && row.publisher !== PUBLISHER_UNAVAILABLE
          ? row.publisher
          : null,
    }),
  );

  return NextResponse.json({ query: q, platform, items });
}
