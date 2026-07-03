import { NextResponse } from "next/server";

import { RANK_TYPES } from "@/lib/constants";
import {
  getAvailableDates,
  getRankings,
  getRisingGames,
} from "@/lib/services/rank-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rankType = searchParams.get("type") ?? "bestseller";
  const date = searchParams.get("date") ?? undefined;

  if (!RANK_TYPES.includes(rankType as (typeof RANK_TYPES)[number])) {
    return NextResponse.json({ error: "无效的 rankType" }, { status: 400 });
  }

  const typedRankType = rankType as (typeof RANK_TYPES)[number];
  const rankings = await getRankings(typedRankType, date ?? undefined);
  const rising = await getRisingGames(typedRankType, date ?? undefined);
  const dates = await getAvailableDates();

  return NextResponse.json({
    dates,
    rankings,
    rising,
  });
}
