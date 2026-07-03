import { HotSearchTable } from "@/components/insights/hot-search-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { PageMetaLine } from "@/components/shared/page-meta-line";
import { PAGE_DESCRIPTIONS } from "@/lib/constants";
import { getMpCookie } from "@/lib/fetchers/mp-client";
import { fetchHotSearchVisits } from "@/lib/fetchers/wechat-mp-insight-fetcher";

export default async function HotSearchPage() {
  if (!getMpCookie()) {
    return (
      <div>
        <PageHeader
          title="用户热搜并访问"
          description={PAGE_DESCRIPTIONS.hotSearch}
        />
        <EmptyState
          title="未配置 MP Cookie"
          description="请在环境变量中设置 WECHAT_MP_COOKIE 后刷新页面。"
        />
      </div>
    );
  }

  try {
    const { date, items } = await fetchHotSearchVisits();

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
