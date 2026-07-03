import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { RankTable } from "@/components/rankings/rank-table";
import { GameAvatar } from "@/components/shared/game-avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DATA_SOURCE_NOTE,
  RANK_TYPE_LABELS,
} from "@/lib/constants";
import {
  getDashboardStats,
  getNewEntries,
  getRankings,
  getRisingGames,
} from "@/lib/services/rank-service";

export default async function HomePage() {
  const stats = await getDashboardStats("bestseller");
  const { items: bestsellerItems, date } = await getRankings("bestseller");
  const { items: risingItems } = await getRisingGames("bestseller", undefined, 5);
  const newEntries = await getNewEntries("bestseller");

  return (
    <div>
      <PageHeader title="榜单概览" description={DATA_SOURCE_NOTE} />

      {!stats.latestDate ? (
        <EmptyState
          title="暂无榜单数据"
          description="数据更新后将在此展示，请稍后再查看。"
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <StatCard
              label="最新数据日期"
              value={stats.latestDate}
              hint="微信榜单通常为 T+1 更新"
            />
            <StatCard
              label="追踪游戏数"
              value={stats.totalGames}
              hint="已入库的小游戏数量"
            />
            <StatCard
              label="今日新上榜"
              value={newEntries.length}
              hint={`${RANK_TYPE_LABELS.bestseller} · ${date}`}
            />
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  {RANK_TYPE_LABELS.bestseller} Top 10
                </h2>
                <Link
                  href="/rankings/bestseller"
                  className="inline-flex items-center gap-1 text-sm text-brand-text hover:text-brand"
                >
                  查看全部
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <RankTable items={bestsellerItems.slice(0, 10)} />
            </div>

            <Card className="border-brand-muted">
              <CardHeader>
                <CardTitle>增速最快 Top 5</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {risingItems.length === 0 ? (
                  <p className="text-sm text-slate-500">暂无上升趋势游戏</p>
                ) : (
                  risingItems.map((item, index) => (
                    <div
                      key={item.gameId}
                      className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        <GameAvatar
                          name={item.name}
                          iconUrl={item.iconUrl}
                          size="sm"
                        />
                        <div>
                          <p className="text-xs text-slate-400">#{index + 1}</p>
                          <Link
                            href={`/games/${item.gameId}`}
                            className="font-medium text-slate-900 hover:text-brand-text"
                          >
                            {item.name}
                          </Link>
                          <p className="mt-1 text-xs text-slate-500">
                            当前 #{item.currentRank} · 日升 {item.dailyChange} 位
                          </p>
                        </div>
                      </div>
                      <span className="rounded-lg bg-brand-soft px-2 py-1 text-xs font-medium text-brand-text">
                        {item.risingScore.toFixed(1)}
                      </span>
                    </div>
                  ))
                )}
                <Link
                  href="/rising"
                  className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-brand-soft px-4 text-sm font-semibold text-brand-text hover:bg-brand-muted"
                >
                  查看增速榜
                </Link>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
