import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { RankTypeTabs } from "@/components/rankings/rank-type-tabs";
import { RankLabelBadges } from "@/components/rankings/rank-label-badges";
import { TrendChart } from "@/components/rankings/trend-chart";
import { EllipsisText } from "@/components/shared/ellipsis-text";
import { GameAvatar } from "@/components/shared/game-avatar";
import { TabsLoadingFallback } from "@/components/shared/page-loading";
import {
  DOUYIN_RANK_TYPE_LABELS,
  DOUYIN_RANK_TYPES,
  DOUYIN_RANKINGS_PATH,
  isDouyinRankType,
  type DouyinRankType,
} from "@/lib/douyin";
import {
  getDouyinGameById,
  getDouyinGameTrend,
  getDouyinRankings,
} from "@/lib/services/douyin-rank-service";
import { createDouyinPageMetadata } from "@/lib/site-seo";
import { uiText } from "@/lib/ui-text";
import { cn, mutedLinkClass } from "@/lib/utils";

interface DouyinGamePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: DouyinGamePageProps): Promise<Metadata> {
  const { id } = await params;
  const { type } = await searchParams;
  const gameId = Number(id);
  const rankType: DouyinRankType = isDouyinRankType(type) ? type : "popular";

  if (Number.isNaN(gameId)) {
    return createDouyinPageMetadata({
      title: "游戏未找到",
      description: "未找到对应的抖音小游戏，请返回榜单页查看其他游戏。",
      path: `/douyin/games/${id}`,
      noIndex: true,
    });
  }

  const game = await getDouyinGameById(gameId);
  if (!game) {
    return createDouyinPageMetadata({
      title: "游戏未找到",
      description: "未找到对应的抖音小游戏，请返回榜单页查看其他游戏。",
      path: `/douyin/games/${id}`,
      noIndex: true,
    });
  }

  const summary = game.category?.trim();
  const description = [
    game.name,
    summary,
    `查看该游戏在抖音小游戏${DOUYIN_RANK_TYPE_LABELS[rankType]}中的排名与历史趋势。`,
  ]
    .filter(Boolean)
    .join("。");

  return createDouyinPageMetadata({
    title: `${game.name} · 抖音小游戏`,
    description,
    path: `/douyin/games/${gameId}`,
  });
}

export default async function DouyinGamePage({
  params,
  searchParams,
}: DouyinGamePageProps) {
  const { id } = await params;
  const { type } = await searchParams;
  const gameId = Number(id);
  const rankType: DouyinRankType = isDouyinRankType(type) ? type : "popular";

  if (Number.isNaN(gameId)) {
    notFound();
  }

  const game = await getDouyinGameById(gameId);
  if (!game) {
    notFound();
  }

  const trend = await getDouyinGameTrend(gameId, rankType);
  const latestRankings = (await getDouyinRankings(rankType)).items.find(
    (item) => item.gameId === gameId,
  );
  const metaDescription = game.category?.trim() || "暂无简介";

  return (
    <div>
      <Link
        href={`${DOUYIN_RANKINGS_PATH}?type=${rankType}`}
        className={cn("mb-4 inline-flex text-sm", mutedLinkClass)}
      >
        ← 返回抖音榜单
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
            <Suspense fallback={<TabsLoadingFallback />}>
              <RankTypeTabs
                activeType={rankType}
                mode="query"
                types={DOUYIN_RANK_TYPES}
                labels={DOUYIN_RANK_TYPE_LABELS}
              />
            </Suspense>
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5">
          <p className={cn("text-xs text-zinc-500 sm:text-sm", uiText.label)}>
            当前排名
          </p>
          <p className="mt-1.5 text-2xl font-semibold whitespace-nowrap text-zinc-900 sm:mt-2 sm:text-3xl">
            {latestRankings ? `#${latestRankings.rank}` : "—"}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5">
          <p className={cn("text-xs text-zinc-500 sm:text-sm", uiText.label)}>
            日变化
          </p>
          <p className="mt-1.5 text-2xl font-semibold whitespace-nowrap text-zinc-900 sm:mt-2 sm:text-3xl">
            {latestRankings?.rankChange != null
              ? latestRankings.rankChange > 0
                ? `+${latestRankings.rankChange}`
                : latestRankings.rankChange
              : "—"}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5 col-span-2 lg:col-span-1">
          <p className={cn("text-xs text-zinc-500 sm:text-sm", uiText.label)}>
            平台
          </p>
          <p className="mt-1.5 text-lg font-semibold text-zinc-900 sm:mt-2">
            抖音小游戏
          </p>
        </div>
      </div>

      <TrendChart
        data={trend}
        title={`${DOUYIN_RANK_TYPE_LABELS[rankType]} · 排名趋势`}
      />
    </div>
  );
}
