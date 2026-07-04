import { HotWordList } from "@/components/insights/hot-word-list";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { PageMetaLine } from "@/components/shared/page-meta-line";
import { PAGE_DESCRIPTIONS } from "@/lib/constants";
import { fetchHotWords } from "@/lib/fetchers/wechat-mp-insight-fetcher";
import { createPageMetadata, SEO_PAGE_COPY } from "@/lib/site-seo";

export const metadata = createPageMetadata(SEO_PAGE_COPY.hotWords);

export default async function HotWordsPage() {
  try {
    const { date, items, source } = await fetchHotWords();

    return (
      <div>
        <PageHeader
          title="热搜词"
          description={PAGE_DESCRIPTIONS.hotWords}
        />

        {items.length === 0 ? (
          <EmptyState
            title="暂无热搜词数据"
            description="数据可能还在计算中，请稍后再查看。"
          />
        ) : (
          <>
            <PageMetaLine
              items={[
                `数据日期 ${date || "—"}`,
                `共 ${items.length} 个热搜词`,
                ...(source === "cache" ? ["缓存数据（MP Cookie 失效时展示）"] : []),
              ]}
            />
            <HotWordList items={items} />
          </>
        )}
      </div>
    );
  } catch (error) {
    return (
      <div>
        <PageHeader
          title="热搜词"
          description={PAGE_DESCRIPTIONS.hotWords}
        />
        <EmptyState
          title="加载失败"
          description={
            error instanceof Error
              ? error.message
              : "无法获取热搜词数据，请检查 Cookie 是否有效。"
          }
        />
      </div>
    );
  }
}
