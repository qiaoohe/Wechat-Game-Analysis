import Link from "next/link";
import { Suspense } from "react";

import { RankTable } from "@/components/rankings/rank-table";
import { RankTypeTabs } from "@/components/rankings/rank-type-tabs";
import { EmptyState } from "@/components/shared/empty-state";
import {
  DateSelectorLoadingFallback,
  TabsLoadingFallback,
} from "@/components/shared/page-loading";
import { PageHeader } from "@/components/shared/page-header";
import { PageMetaLine } from "@/components/shared/page-meta-line";
import { DateSelector } from "@/components/shared/date-selector";
import {
  DOUYIN_GAMES_PATH,
  DOUYIN_PAGE_DESCRIPTIONS,
  DOUYIN_RANK_TYPE_LABELS,
  DOUYIN_RANK_TYPES,
  isDouyinRankType,
  type DouyinRankType,
} from "@/lib/douyin";
import {
  getDouyinAvailableDates,
  getDouyinRankings,
} from "@/lib/services/douyin-rank-service";
import {
  createDouyinPageMetadata,
  DOUYIN_SITE_NAME_ZH,
  SEO_PAGE_COPY,
  SITE_URL,
} from "@/lib/site-seo";

export const metadata = createDouyinPageMetadata(SEO_PAGE_COPY.douyinRankings);

interface DouyinRankingsPageProps {
  searchParams: Promise<{ type?: string; date?: string }>;
}

function DouyinRankingsJsonLd({
  rankType,
  date,
  itemCount,
}: {
  rankType: DouyinRankType;
  date: string;
  itemCount: number;
}) {
  if (itemCount === 0) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${DOUYIN_SITE_NAME_ZH} · ${DOUYIN_RANK_TYPE_LABELS[rankType]}`,
    description: SEO_PAGE_COPY.douyinRankings.description,
    url: `${SITE_URL}/douyin/rankings?type=${rankType}${date ? `&date=${date}` : ""}`,
    numberOfItems: itemCount,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function DouyinRankingsPage({
  searchParams,
}: DouyinRankingsPageProps) {
  const { type, date: selectedDate } = await searchParams;
  const rankType: DouyinRankType = isDouyinRankType(type) ? type : "popular";
  const dates = await getDouyinAvailableDates();
  const { date, previousDate, items } = await getDouyinRankings(
    rankType,
    selectedDate,
    dates,
  );

  return (
    <div>
      <DouyinRankingsJsonLd
        rankType={rankType}
        date={date}
        itemCount={items.length}
      />

      <PageHeader
        title={DOUYIN_SITE_NAME_ZH}
        description={DOUYIN_PAGE_DESCRIPTIONS.rankings}
      />

      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Suspense fallback={<TabsLoadingFallback />}>
          <RankTypeTabs
            activeType={rankType}
            mode="query"
            types={DOUYIN_RANK_TYPES}
            labels={DOUYIN_RANK_TYPE_LABELS}
          />
        </Suspense>

        {dates.length > 0 ? (
          <Suspense fallback={<DateSelectorLoadingFallback />}>
            <DateSelector dates={dates} currentDate={date} />
          </Suspense>
        ) : null}
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="抖音榜数据准备中"
          description="热门榜、畅销榜、新游榜接入完成后将在此每日更新。微信小游戏榜单不受影响，可先前往微信榜单查看。"
          action={
            <Link
              href="/rankings"
              className="inline-flex rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition-opacity hover:opacity-90"
            >
              查看微信榜单
            </Link>
          }
        />
      ) : (
        <>
          <PageMetaLine
            items={[
              DOUYIN_RANK_TYPE_LABELS[rankType],
              `数据日期：${date}`,
              ...(previousDate ? [`对比日期：${previousDate}`] : []),
              `共 ${items.length} 款`,
            ]}
          />

          <RankTable items={items} gameHrefPrefix={DOUYIN_GAMES_PATH} />
        </>
      )}
    </div>
  );
}
