import Link from "next/link";
import { Suspense } from "react";

import { RankTable } from "@/components/rankings/rank-table";
import { RankTypeTabs } from "@/components/rankings/rank-type-tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { DateSelector } from "@/components/shared/date-selector";
import {
  RANK_TYPE_DESCRIPTIONS,
  RANK_TYPE_LABELS,
  RANK_TYPES,
  type RankType,
} from "@/lib/constants";
import {
  getAvailableDates,
  getDroppedGames,
  getNewEntries,
  getRankings,
} from "@/lib/services/rank-service";

interface RankingsPageProps {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ date?: string }>;
}

function isRankType(value: string): value is RankType {
  return RANK_TYPES.includes(value as RankType);
}

export default async function RankingsPage({
  params,
  searchParams,
}: RankingsPageProps) {
  const { type } = await params;
  const { date: selectedDate } = await searchParams;
  const rankType = isRankType(type) ? type : "bestseller";
  const dates = await getAvailableDates();
  const { date, previousDate, items } = await getRankings(
    rankType,
    selectedDate,
  );
  const newEntries = await getNewEntries(rankType, date || undefined);
  const droppedGames = await getDroppedGames(rankType, date || undefined);

  return (
    <div>
      <PageHeader
        title={RANK_TYPE_LABELS[rankType]}
        description={RANK_TYPE_DESCRIPTIONS[rankType]}
      />

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Suspense fallback={null}>
          <RankTypeTabs activeType={rankType} basePath="/rankings" />
        </Suspense>

        {dates.length > 0 ? (
          <Suspense fallback={null}>
            <DateSelector dates={dates} currentDate={date} />
          </Suspense>
        ) : null}
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="该日期暂无榜单数据"
          description="请切换其他日期查看，或等待数据更新。"
        />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-4 text-sm text-zinc-500">
            <span>数据日期：{date}</span>
            {previousDate ? <span>对比日期：{previousDate}</span> : null}
            <span>共 {items.length} 款</span>
          </div>

          <RankTable items={items} />

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-zinc-200 bg-white p-6">
              <h3 className="text-base font-semibold text-zinc-900">新上榜</h3>
              <div className="mt-4 space-y-3">
                {newEntries.length === 0 ? (
                  <p className="text-sm text-zinc-500">今日无新上榜游戏</p>
                ) : (
                  newEntries.map((item) => (
                    <div
                      key={item.gameId}
                      className="flex items-center justify-between text-sm"
                    >
                      <Link
                        href={`/games/${item.gameId}`}
                        className="font-medium hover:underline"
                      >
                        {item.name}
                      </Link>
                      <span className="text-zinc-500">#{item.rank}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-6">
              <h3 className="text-base font-semibold text-zinc-900">掉出榜单</h3>
              <div className="mt-4 space-y-3">
                {droppedGames.length === 0 ? (
                  <p className="text-sm text-zinc-500">无掉榜游戏</p>
                ) : (
                  droppedGames.map((item) => (
                    <div
                      key={item.gameId}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>{item.name}</span>
                      <span className="text-zinc-500">
                        上次 #{item.lastRank}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
