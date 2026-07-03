import { Suspense } from "react";

import { RankTypeTabs } from "@/components/rankings/rank-type-tabs";
import { RisingTable } from "@/components/rankings/rising-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import {
  RANK_TYPE_LABELS,
  RANK_TYPES,
  type RankType,
} from "@/lib/constants";
import { getRisingGames } from "@/lib/services/rank-service";

interface RisingPageProps {
  searchParams: Promise<{ type?: string }>;
}

function isRankType(value?: string): value is RankType {
  return !!value && RANK_TYPES.includes(value as RankType);
}

export default async function RisingPage({ searchParams }: RisingPageProps) {
  const { type } = await searchParams;
  const rankType = isRankType(type) ? type : "bestseller";
  const { date, items } = await getRisingGames(rankType, undefined, 30);

  return (
    <div>
      <PageHeader
        title="增速榜"
        description="综合日环比、7 日变化和连续上升天数，识别排名快速上升的小游戏。"
      />

      <div className="mb-6">
        <Suspense fallback={null}>
          <RankTypeTabs activeType={rankType} mode="query" />
        </Suspense>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="暂无增速数据"
          description="需要至少 2 天的榜单数据才能计算增速，请稍后再查看。"
        />
      ) : (
        <>
          <p className="mb-4 text-sm text-zinc-500">
            {RANK_TYPE_LABELS[rankType]} · 数据日期 {date} · 共 {items.length} 款上升趋势游戏
          </p>
          <RisingTable items={items} />
        </>
      )}
    </div>
  );
}
