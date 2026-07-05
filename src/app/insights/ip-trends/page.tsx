import { Suspense } from "react";

import { IpTrendPagination } from "@/components/insights/ip-trend-pagination";
import { IpTrendSortTabs } from "@/components/insights/ip-trend-sort-tabs";
import { IpTrendTable } from "@/components/insights/ip-trend-table";
import { EmptyState } from "@/components/shared/empty-state";
import { TabsLoadingFallback } from "@/components/shared/page-loading";
import { PageHeader } from "@/components/shared/page-header";
import { PageMetaLine } from "@/components/shared/page-meta-line";
import { PAGE_DESCRIPTIONS } from "@/lib/constants";
import { getMpCookie } from "@/lib/fetchers/mp-client";
import {
  fetchIpTrends,
  IP_TREND_SORT_LABELS,
  type IpTrendSortType,
} from "@/lib/fetchers/wechat-mp-insight-fetcher";
import { createPageMetadata, SEO_PAGE_COPY } from "@/lib/site-seo";
import { buildInsightMetaItems } from "@/lib/utils/insight-meta";

export const metadata = createPageMetadata(SEO_PAGE_COPY.ipTrends);

interface IpTrendsPageProps {
  searchParams: Promise<{ sort?: string; page?: string }>;
}

function parseSort(value?: string): IpTrendSortType {
  return value === "3" ? 3 : 4;
}

function parsePage(value?: string) {
  const page = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export default async function IpTrendsPage({ searchParams }: IpTrendsPageProps) {
  const { sort: sortParam, page: pageParam } = await searchParams;
  const sort = parseSort(sortParam);
  const page = parsePage(pageParam);

  if (!getMpCookie()) {
    return (
      <div>
        <PageHeader
          title="合作 IP 热度趋势"
          description={PAGE_DESCRIPTIONS.ipTrends}
        />
        <EmptyState
          title="未配置 MP Cookie"
          description="请在环境变量中设置 WECHAT_MP_COOKIE 后刷新页面。"
        />
      </div>
    );
  }

  try {
    const {
      items,
      totalCount,
      page: currentPage,
      pageSize,
      totalPages,
      dataDate,
    } = await fetchIpTrends(sort, page);

    const rangeStart =
      items.length > 0 ? (currentPage - 1) * pageSize + 1 : 0;
    const rangeEnd = items.length > 0 ? rangeStart + items.length - 1 : 0;

    return (
      <div>
        <PageHeader
          title="合作 IP 热度趋势"
          description={PAGE_DESCRIPTIONS.ipTrends}
        />

        <div className="mb-6">
          <Suspense fallback={<TabsLoadingFallback />}>
            <IpTrendSortTabs activeSort={String(sort)} />
          </Suspense>
        </div>

        {items.length === 0 ? (
          <EmptyState
            title="暂无 IP 数据"
            description="请稍后再查看，或切换排序方式。"
          />
        ) : (
          <>
            <PageMetaLine
              items={[
                ...buildInsightMetaItems({
                  dataDate,
                  countLabel:
                    items.length > 0
                      ? `第 ${rangeStart}–${rangeEnd} 名 · 共 ${totalCount} 个 IP`
                      : `共 ${totalCount} 个 IP`,
                }),
                IP_TREND_SORT_LABELS[sort],
              ]}
            />
            <IpTrendTable items={items} />
            <IpTrendPagination
              page={currentPage}
              totalPages={totalPages}
              sort={String(sort)}
            />
          </>
        )}
      </div>
    );
  } catch (error) {
    return (
      <div>
        <PageHeader
          title="合作 IP 热度趋势"
          description={PAGE_DESCRIPTIONS.ipTrends}
        />
        <EmptyState
          title="加载失败"
          description={
            error instanceof Error
              ? error.message
              : "无法获取 IP 热度数据，请检查 Cookie 是否有效。"
          }
        />
      </div>
    );
  }
}
