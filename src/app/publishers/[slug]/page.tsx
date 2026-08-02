import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { PublisherGameList } from "@/components/publishers/publisher-game-list";
import { RankTypeTabs } from "@/components/rankings/rank-type-tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { PageMetaLine } from "@/components/shared/page-meta-line";
import { TabsLoadingFallback } from "@/components/shared/page-loading";
import { Card, CardContent } from "@/components/ui/card";
import {
  RANK_TYPE_LABELS,
  RANK_TYPES,
  type RankType,
} from "@/lib/constants";
import {
  decodePublisherSlug,
  getPublisherPage,
  publisherPath,
} from "@/lib/services/publisher-service";
import { createPageMetadata } from "@/lib/site-seo";
import { uiText } from "@/lib/ui-text";
import { cn, mutedLinkClass } from "@/lib/utils";

interface PublisherPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ type?: string }>;
}

function isRankType(value?: string): value is RankType {
  return !!value && RANK_TYPES.includes(value as RankType);
}

export async function generateMetadata({
  params,
}: PublisherPageProps): Promise<Metadata> {
  const { slug } = await params;
  const name = decodePublisherSlug(slug);

  if (!name) {
    return createPageMetadata({
      title: "开发商未找到",
      description: "未找到对应的开发商信息。",
      path: `/publishers/${slug}`,
      noIndex: true,
    });
  }

  const path = publisherPath(name) ?? `/publishers/${name}`;

  return createPageMetadata({
    title: name,
    description: `查看 ${name} 旗下微信小游戏列表、榜单排名与表现。`,
    path,
  });
}

export default async function PublisherPage({
  params,
  searchParams,
}: PublisherPageProps) {
  const { slug } = await params;
  const { type } = await searchParams;
  const rankType = isRankType(type) ? type : "bestseller";
  const name = decodePublisherSlug(slug);

  if (!name) {
    notFound();
  }

  const data = await getPublisherPage(name, rankType);
  if (!data) {
    notFound();
  }

  return (
    <div>
      <Link
        href={`/rankings?type=${rankType}`}
        className={cn("mb-4 inline-flex text-sm", mutedLinkClass)}
      >
        ← 返回榜单
      </Link>

      <PageHeader
        title={data.name}
        description="该开发商旗下已收录的小游戏及其榜单表现。"
        action={
          <Suspense fallback={<TabsLoadingFallback />}>
            <RankTypeTabs activeType={rankType} mode="query" />
          </Suspense>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5">
          <p className={cn("text-xs text-zinc-500 sm:text-sm", uiText.label)}>
            旗下游戏
          </p>
          <p className="mt-1.5 text-2xl font-semibold whitespace-nowrap text-zinc-900 sm:mt-2 sm:text-3xl">
            {data.gameCount}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5">
          <p className={cn("text-xs text-zinc-500 sm:text-sm", uiText.label)}>
            当前上榜
          </p>
          <p className="mt-1.5 text-2xl font-semibold whitespace-nowrap text-zinc-900 sm:mt-2 sm:text-3xl">
            {data.onListCount}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5">
          <p className={cn("text-xs text-zinc-500 sm:text-sm", uiText.label)}>
            最佳排名
          </p>
          <p className="mt-1.5 text-2xl font-semibold whitespace-nowrap text-zinc-900 sm:mt-2 sm:text-3xl">
            {data.bestRank != null ? `#${data.bestRank}` : "—"}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5">
          <p className={cn("text-xs text-zinc-500 sm:text-sm", uiText.label)}>
            榜单
          </p>
          <p className="mt-1.5 text-lg font-semibold text-zinc-900 sm:mt-2 sm:text-xl">
            {RANK_TYPE_LABELS[rankType]}
          </p>
        </div>
      </div>

      {data.games.length === 0 ? (
        <EmptyState
          title="暂无游戏"
          description="该开发商下暂未收录小游戏。"
        />
      ) : (
        <>
          <PageMetaLine
            items={[
              RANK_TYPE_LABELS[rankType],
              data.date ? `数据日期 ${data.date}` : null,
              `共 ${data.gameCount} 款游戏`,
            ].filter(Boolean) as string[]}
          />
          <Card className="overflow-hidden border-slate-200/80">
            <CardContent className="p-0">
              <PublisherGameList items={data.games} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
