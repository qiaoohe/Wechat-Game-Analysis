import { Suspense } from "react";

import { RankTable } from "@/components/rankings/rank-table";
import { RankTypeTabs } from "@/components/rankings/rank-type-tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { PageMetaLine } from "@/components/shared/page-meta-line";
import { DateSelector } from "@/components/shared/date-selector";
import {
  PAGE_DESCRIPTIONS,
  RANK_TYPE_LABELS,
  RANK_TYPES,
  type RankType,
} from "@/lib/constants";
import { getAvailableDates, getRankings } from "@/lib/services/rank-service";
import { createPageMetadata, SEO_PAGE_COPY } from "@/lib/site-seo";

export const metadata = createPageMetadata(SEO_PAGE_COPY.rankings);

interface RankingsPageProps {
  searchParams: Promise<{ type?: string; date?: string }>;
}

function isRankType(value?: string): value is RankType {
  return !!value && RANK_TYPES.includes(value as RankType);
}

export default async function RankingsPage({ searchParams }: RankingsPageProps) {
  const { type, date: selectedDate } = await searchParams;
  const rankType = isRankType(type) ? type : "bestseller";
  const dates = await getAvailableDates();
  const { date, previousDate, items } = await getRankings(
    rankType,
    selectedDate,
  );

  return (
    <div>
      <PageHeader
        title="榜单"
        description={PAGE_DESCRIPTIONS.rankings}
      />

      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Suspense fallback={null}>
          <RankTypeTabs activeType={rankType} mode="query" />
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
          <PageMetaLine
            items={[
              RANK_TYPE_LABELS[rankType],
              `数据日期：${date}`,
              ...(previousDate ? [`对比日期：${previousDate}`] : []),
              `共 ${items.length} 款`,
            ]}
          />

          <RankTable items={items} />
        </>
      )}
    </div>
  );
}
