import { Suspense } from "react";

import { IpTrendSortTabs } from "@/components/insights/ip-trend-sort-tabs";
import { IpTrendTable } from "@/components/insights/ip-trend-table";
import { EmptyState } from "@/components/shared/empty-state";
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

export const metadata = createPageMetadata(SEO_PAGE_COPY.ipTrends);

interface IpTrendsPageProps {
  searchParams: Promise<{ sort?: string }>;
}

function parseSort(value?: string): IpTrendSortType {
  return value === "3" ? 3 : 4;
}

export default async function IpTrendsPage({ searchParams }: IpTrendsPageProps) {
  const { sort: sortParam } = await searchParams;
  const sort = parseSort(sortParam);

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
    const { items, totalCount } = await fetchIpTrends(sort);

    return (
      <div>
        <PageHeader
          title="合作 IP 热度趋势"
          description={PAGE_DESCRIPTIONS.ipTrends}
        />

        <div className="mb-6">
          <Suspense fallback={null}>
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
                IP_TREND_SORT_LABELS[sort],
                `展示 Top ${items.length}${totalCount > items.length ? ` / 共 ${totalCount} 个 IP` : ""}`,
              ]}
            />
            <IpTrendTable items={items} />
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
