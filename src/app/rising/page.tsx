import { Suspense } from "react";

import { RisingTable } from "@/components/rankings/rising-table";
import { RankTypeTabs } from "@/components/rankings/rank-type-tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { PageMetaLine } from "@/components/shared/page-meta-line";
import {
  PAGE_DESCRIPTIONS,
  RANK_TYPE_LABELS,
  RANK_TYPES,
  type RankType,
} from "@/lib/constants";
import { getRisingGames } from "@/lib/services/rank-service";
import { createPageMetadata, SEO_PAGE_COPY } from "@/lib/site-seo";

export const metadata = createPageMetadata(SEO_PAGE_COPY.rising);

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
        description={PAGE_DESCRIPTIONS.rising}
      />

      <div className="mb-4">
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
          <PageMetaLine
            items={[
              RANK_TYPE_LABELS[rankType],
              `数据日期 ${date}`,
              `共 ${items.length} 款上升趋势游戏`,
            ]}
          />
          <RisingTable items={items} />
        </>
      )}
    </div>
  );
}
