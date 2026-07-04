import { HotSearchTable } from "@/components/insights/hot-search-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { PageMetaLine } from "@/components/shared/page-meta-line";
import { PAGE_DESCRIPTIONS } from "@/lib/constants";
import { fetchHotSearchVisits } from "@/lib/fetchers/wechat-mp-insight-fetcher";
import { createPageMetadata, SEO_PAGE_COPY } from "@/lib/site-seo";

export const metadata = createPageMetadata(SEO_PAGE_COPY.hotSearch);

export default async function HotSearchPage() {
  try {
    const { date, items, source } = await fetchHotSearchVisits();

    return (
      <div>
        <PageHeader
          title="用户热搜并访问"
          description={PAGE_DESCRIPTIONS.hotSearch}
        />

        {items.length === 0 ? (
          <EmptyState
            title="暂无数据"
            description="数据可能还在计算中，请稍后再查看。"
          />
        ) : (
          <>
            <PageMetaLine
              items={[
                `数据日期 ${date || "—"}`,
                `共 ${items.length} 款游戏`,
                ...(source === "cache" ? ["缓存数据（MP Cookie 失效时展示）"] : []),
              ]}
            />
            <HotSearchTable items={items} />
          </>
        )}
      </div>
    );
  } catch (error) {
    return (
      <div>
        <PageHeader
          title="用户热搜并访问"
          description={PAGE_DESCRIPTIONS.hotSearch}
        />
        <EmptyState
          title="加载失败"
          description={
            error instanceof Error
              ? error.message
              : "无法获取数据，请检查 Cookie 是否有效。"
          }
        />
      </div>
    );
  }
}
