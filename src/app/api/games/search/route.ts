import { NextResponse } from "next/server";

import { searchGames } from "@/lib/services/rank-service";
import { PUBLISHER_UNAVAILABLE } from "@/lib/services/publisher-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const limitRaw = Number(searchParams.get("limit") ?? "8");
  const limit =
    Number.isFinite(limitRaw) && limitRaw > 0
      ? Math.min(Math.floor(limitRaw), 20)
      : 8;

  if (q.length < 1) {
    return NextResponse.json({ query: q, items: [] });
  }

  const rows = await searchGames(q, limit);
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

  return NextResponse.json({ query: q, items });
}
