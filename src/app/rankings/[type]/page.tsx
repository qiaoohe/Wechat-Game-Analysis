import { redirect } from "next/navigation";

import { RANK_TYPES, type RankType } from "@/lib/constants";

interface RankingsTypeRedirectProps {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ date?: string }>;
}

function isRankType(value: string): value is RankType {
  return RANK_TYPES.includes(value as RankType);
}

/** 兼容旧链接 /rankings/[type] → /rankings?type= */
export default async function RankingsTypeRedirect({
  params,
  searchParams,
}: RankingsTypeRedirectProps) {
  const { type } = await params;
  const { date } = await searchParams;
  const query = new URLSearchParams({
    type: isRankType(type) ? type : "bestseller",
  });

  if (date) {
    query.set("date", date);
  }

  redirect(`/rankings?${query.toString()}`);
}
