import { NextResponse } from "next/server";
import { inArray } from "drizzle-orm";

import { db, games, initDatabase } from "@/lib/db";
import { PUBLISHER_UNAVAILABLE } from "@/lib/services/publisher-service";

/** 按 id 批量取游戏名（后台 chips 回填用） */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = (searchParams.get("ids") ?? "")
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0)
    .slice(0, 50);

  if (ids.length === 0) {
    return NextResponse.json({ items: [] });
  }

  await initDatabase();
  const rows = (await db
    .select({
      id: games.id,
      name: games.name,
      publisher: games.publisher,
    })
    .from(games)
    .where(inArray(games.id, ids))) as Array<{
    id: number;
    name: string;
    publisher: string | null;
  }>;

  return NextResponse.json({
    items: rows.map((row) => ({
      id: row.id,
      name: row.name,
      publisher:
        row.publisher && row.publisher !== PUBLISHER_UNAVAILABLE
          ? row.publisher
          : null,
    })),
  });
}
