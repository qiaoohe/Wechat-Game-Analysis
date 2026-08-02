import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { HomeRisingList } from "@/components/home/home-rising-list";
import { RankTablePanel } from "@/components/rankings/rank-table-panel";
import { GameAvatar } from "@/components/shared/game-avatar";
import { EllipsisText } from "@/components/shared/ellipsis-text";
import { CardPanelHeader } from "@/components/shared/card-panel-header";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { RANK_TYPE_LABELS } from "@/lib/constants";
import { getDataSourceNote } from "@/lib/fetchers/rank-fetcher";
import { uiText } from "@/lib/ui-text";
import { cn, panelActionLinkClass, textLinkClass } from "@/lib/utils";
import {
  BRAND_NAME,
  createPageMetadata,
  SEO_PAGE_COPY,
  SITE_NAME_ZH,
} from "@/lib/site-seo";
import { getHomePageData } from "@/lib/services/rank-service";

export const metadata = createPageMetadata(SEO_PAGE_COPY.home);

export default async function HomePage() {
  const {
    latestDate,
    totalGames,
    newEntriesCount,
    date,
    bestsellerItems,
    risingItems,
  } = await getHomePageData("bestseller");

  return (
    <div>
      <PageHeader
        title={`${SITE_NAME_ZH} - ${BRAND_NAME}`}
        description={getDataSourceNote()}
      />

      {!latestDate ? (
        <EmptyState
          title="暂无榜单数据"
          description="数据更新后将在此展示，请稍后再查看。"
        />
      ) : (
        <>
          <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="最新数据日期"
              value={latestDate}
              hint="指标每天更新"
            />
            <StatCard
              label="追踪游戏数"
              value={totalGames}
              hint="已入库的小游戏数量"
            />
            <StatCard
              label="今日新上榜"
              value={newEntriesCount}
              hint={`${RANK_TYPE_LABELS.bestseller} · ${date}`}
            />

            <RankTablePanel
              className="md:col-span-2 lg:col-span-2"
              mobileCards
              title={`${RANK_TYPE_LABELS.bestseller} Top 10`}
              action={
                <Link href="/rankings?type=bestseller" className={panelActionLinkClass}>
                  查看全部
                  <ArrowRight className="h-4 w-4" />
                </Link>
              }
              items={bestsellerItems.slice(0, 10)}
            />

            <Card className="flex h-full flex-col border-slate-200/80 bg-white md:col-span-2 lg:col-span-1">
              <CardPanelHeader
                title="增速最快 Top 10"
                action={
                  <Link href="/rising" className={panelActionLinkClass}>
                    查看全部
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                }
              />

              {risingItems.length === 0 ? (
                <CardContent className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
                  <p className="text-sm text-slate-500">暂无上升趋势游戏</p>
                </CardContent>
              ) : (
                <>
                  <div className="min-h-0 flex-1 md:hidden">
                    <HomeRisingList items={risingItems} />
                  </div>
                  <CardContent className="hidden min-h-0 flex-1 flex-col px-0 pb-0 pt-0 md:flex">
                    <div className="flex h-full flex-col divide-y divide-slate-50">
                      {risingItems.map((item, index) => (
                        <div
                          key={item.gameId}
                          className="flex flex-1 items-center justify-between gap-3 px-5 py-3.5 sm:px-6"
                        >
                          <div className="flex min-w-0 flex-1 items-center gap-3">
                            <span
                              className={cn(
                                "inline-flex h-8 min-w-8 shrink-0 items-center justify-center rounded-lg px-1.5 text-sm font-semibold tabular-nums",
                                index < 3
                                  ? "bg-brand text-brand-foreground"
                                  : "bg-slate-100 text-slate-700",
                                uiText.num,
                              )}
                            >
                              {index + 1}
                            </span>
                            <GameAvatar
                              name={item.name}
                              iconUrl={item.iconUrl}
                              size="rank"
                              className="!h-12 !w-12"
                            />
                            <div className="min-w-0 flex-1">
                              <Link
                                href={`/games/${item.gameId}`}
                                className={cn("block leading-5", textLinkClass)}
                              >
                                <EllipsisText>{item.name}</EllipsisText>
                              </Link>
                              <p
                                className={cn(
                                  "mt-0.5 text-xs leading-5 text-slate-500",
                                  uiText.label,
                                )}
                              >
                                当前 #{item.currentRank} · 日升 {item.dailyChange}{" "}
                                位
                              </p>
                            </div>
                          </div>
                          <span className="shrink-0 rounded-lg bg-brand-soft px-2 py-1 text-xs font-medium whitespace-nowrap text-brand-text tabular-nums">
                            {item.risingScore.toFixed(1)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
