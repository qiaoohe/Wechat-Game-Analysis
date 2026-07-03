import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { RankTypeTabs } from "@/components/rankings/rank-type-tabs";
import { GameAvatar } from "@/components/shared/game-avatar";
import { EllipsisText } from "@/components/shared/ellipsis-text";
import { RankLabelBadges } from "@/components/rankings/rank-label-badges";
import { TrendChart } from "@/components/rankings/trend-chart";
import {
  RANK_TYPE_LABELS,
  RANK_TYPES,
  type RankType,
} from "@/lib/constants";
import { cn, mutedLinkClass } from "@/lib/utils";
import { uiText } from "@/lib/ui-text";
import { createPageMetadata } from "@/lib/site-seo";
import {
  getGameById,
  getGameTrend,
  getRankings,
} from "@/lib/services/rank-service";

interface GamePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string }>;
}

function isRankType(value?: string): value is RankType {
  return !!value && RANK_TYPES.includes(value as RankType);
}

export async function generateMetadata({
  params,
  searchParams,
}: GamePageProps): Promise<Metadata> {
  const { id } = await params;
  const { type } = await searchParams;
  const gameId = Number(id);
  const rankType = isRankType(type) ? type : "bestseller";

  if (Number.isNaN(gameId)) {
    return createPageMetadata({
      title: "游戏未找到",
      description: "未找到对应的小游戏，请返回榜单页查看其他游戏。",
      path: `/games/${id}`,
      noIndex: true,
    });
  }

  const game = await getGameById(gameId);
  if (!game) {
    return createPageMetadata({
      title: "游戏未找到",
      description: "未找到对应的小游戏，请返回榜单页查看其他游戏。",
      path: `/games/${id}`,
      noIndex: true,
    });
  }

  const summary = game.category?.trim();
  const description = summary
    ? `${game.name}：${summary}。查看该游戏在${RANK_TYPE_LABELS[rankType]}中的排名、变化趋势与历史数据。`
    : `查看 ${game.name} 在微信小游戏${RANK_TYPE_LABELS[rankType]}中的排名、变化趋势与历史数据。`;

  return createPageMetadata({
    title: game.name,
    description,
    path: `/games/${gameId}`,
  });
}

export default async function GamePage({
  params,
  searchParams,
}: GamePageProps) {
  const { id } = await params;
  const { type } = await searchParams;
  const gameId = Number(id);
  const rankType = isRankType(type) ? type : "bestseller";

  if (Number.isNaN(gameId)) {
    notFound();
  }

  const game = await getGameById(gameId);
  if (!game) {
    notFound();
  }

  const trend = await getGameTrend(gameId, rankType);
  const latestRankings = (await getRankings(rankType)).items.find(
    (item) => item.gameId === gameId,
  );

  const metaDescription = game.category?.trim() || "暂无简介";

  return (
    <div>
      <Link
        href={`/rankings?type=${rankType}`}
        className={cn("mb-4 inline-flex text-sm", mutedLinkClass)}
      >
        ← 返回榜单
      </Link>

      <div className="mb-6 rounded-xl border border-slate-200/80 bg-white p-4 sm:mb-8 sm:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-6">
          <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-5">
            <GameAvatar
              name={game.name}
              iconUrl={game.iconUrl}
              size="lg"
              className="!h-12 !w-12 shrink-0 sm:!h-14 sm:!w-14"
            />
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
                {game.name}
              </h1>
              <EllipsisText
                lines={2}
                className="mt-1.5 text-sm leading-6 text-zinc-500"
              >
                {metaDescription}
              </EllipsisText>
              {latestRankings?.rankLabels?.length ? (
                <div className="mt-3">
                  <RankLabelBadges labels={latestRankings.rankLabels} />
                </div>
              ) : null}
            </div>
          </div>

          <div className="w-full shrink-0 md:ml-auto md:w-auto md:pt-1">
            <Suspense fallback={null}>
              <RankTypeTabs activeType={rankType} mode="query" />
            </Suspense>
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5">
          <p className={cn("text-xs text-zinc-500 sm:text-sm", uiText.label)}>当前排名</p>
          <p className="mt-1.5 text-2xl font-semibold whitespace-nowrap text-zinc-900 sm:mt-2 sm:text-3xl">
            {latestRankings ? `#${latestRankings.rank}` : "—"}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5">
          <p className={cn("text-xs text-zinc-500 sm:text-sm", uiText.label)}>日变化</p>
          <p className="mt-1.5 text-2xl font-semibold whitespace-nowrap text-zinc-900 sm:mt-2 sm:text-3xl">
            {latestRankings?.rankChange != null
              ? latestRankings.rankChange > 0
                ? `+${latestRankings.rankChange}`
                : latestRankings.rankChange
              : "—"}
          </p>
        </div>
        <div className="col-span-2 rounded-xl border border-slate-200/80 bg-white p-4 sm:col-span-1 sm:p-5">
          <p className={cn("text-xs text-zinc-500 sm:text-sm", uiText.label)}>AppID</p>
          <p
            className={cn("mt-2 text-sm font-medium text-zinc-900", uiText.line1)}
            title={game.appId ?? undefined}
          >
            {game.appId ?? "未录入"}
          </p>
        </div>
      </div>

      <TrendChart
        data={trend}
        title={`${RANK_TYPE_LABELS[rankType]} · 排名趋势`}
      />
    </div>
  );
}
