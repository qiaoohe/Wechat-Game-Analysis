import { Suspense } from "react";

import { RisingTable } from "@/components/rankings/rising-table";
import { RankTypeTabs } from "@/components/rankings/rank-type-tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { TabsLoadingFallback } from "@/components/shared/page-loading";
import { PageHeader } from "@/components/shared/page-header";
import { PageMetaLine } from "@/components/shared/page-meta-line";
import {
  DOUYIN_GAMES_PATH,
  DOUYIN_PAGE_DESCRIPTIONS,
  DOUYIN_RANK_TYPE_LABELS,
  DOUYIN_RANK_TYPES,
  isDouyinRankType,
  type DouyinRankType,
} from "@/lib/douyin";
import { getDouyinRisingGames } from "@/lib/services/douyin-rank-service";
import {
  createDouyinPageMetadata,
  SEO_PAGE_COPY,
} from "@/lib/site-seo";

export const metadata = createDouyinPageMetadata(SEO_PAGE_COPY.douyinRising);

interface DouyinRisingPageProps {
  searchParams: Promise<{ type?: string }>;
}

export default async function DouyinRisingPage({
  searchParams,
}: DouyinRisingPageProps) {
  const { type } = await searchParams;
  const rankType: DouyinRankType = isDouyinRankType(type) ? type : "popular";
  const { date, items } = await getDouyinRisingGames(rankType, undefined, 30);

  return (
    <div>
      <PageHeader
        title="增速榜"
        description={DOUYIN_PAGE_DESCRIPTIONS.rising}
      />

      <div className="mb-4">
        <Suspense fallback={<TabsLoadingFallback />}>
          <RankTypeTabs
            activeType={rankType}
            mode="query"
            types={DOUYIN_RANK_TYPES}
            labels={DOUYIN_RANK_TYPE_LABELS}
          />
        </Suspense>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="暂无增速数据"
          description="需要至少 2 天的抖音榜单数据才能计算增速，请稍后再查看。"
        />
      ) : (
        <>
          <PageMetaLine
            items={[
              DOUYIN_RANK_TYPE_LABELS[rankType],
              `数据日期 ${date}`,
              `共 ${items.length} 款上升趋势游戏`,
            ]}
          />
          <RisingTable
            items={items}
            rankTypeLabel={DOUYIN_RANK_TYPE_LABELS[rankType]}
            gameHrefPrefix={DOUYIN_GAMES_PATH}
          />
        </>
      )}
    </div>
  );
}
