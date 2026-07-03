import Link from "next/link";
import { notFound } from "next/navigation";

import { GameAvatar } from "@/components/shared/game-avatar";
import { TrendChart } from "@/components/rankings/trend-chart";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import {
  RANK_TYPES,
  RANK_TYPE_LABELS,
  type RankType,
} from "@/lib/constants";
import {
  getGameById,
  getGameTrend,
  getRankings,
} from "@/lib/services/rank-service";

interface GamePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string }>;
}

function isRankType(value?: string): value is RankType {
  return !!value && RANK_TYPES.includes(value as RankType);
}

export default async function GamePage({
  params,
  searchParams,
}: GamePageProps) {
  const { id } = await params;
  const { type } = await searchParams;
  const gameId = Number(id);
  const rankType = isRankType(type) ? type : "bestseller";

  if (Number.isNaN(gameId)) {
    notFound();
  }

  const game = await getGameById(gameId);
  if (!game) {
    notFound();
  }

  const trend = await getGameTrend(gameId, rankType);
  const latestRankings = (await getRankings(rankType)).items.find(
    (item) => item.gameId === gameId,
  );

  return (
    <div>
      <PageHeader
        title={game.name}
        description={`${game.publisher ?? "未知发行商"} · ${game.category ?? "未分类"}`}
        action={
          <Link
            href="/rankings/bestseller"
            className="text-sm text-zinc-500 hover:text-zinc-900"
          >
            返回榜单
          </Link>
        }
      />

      <div className="mb-6 flex items-start gap-4">
        <GameAvatar name={game.name} iconUrl={game.iconUrl} size="lg" />
        <div className="flex flex-wrap gap-2">
        {RANK_TYPES.map((item) => (
          <Link key={item} href={`/games/${gameId}?type=${item}`}>
            <Badge variant={rankType === item ? "default" : "outline"} className={rankType === item ? "bg-brand font-semibold text-brand-foreground hover:bg-brand" : ""}>
              {RANK_TYPE_LABELS[item]}
            </Badge>
          </Link>
        ))}
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <p className="text-sm text-zinc-500">当前排名</p>
          <p className="mt-2 text-3xl font-semibold text-zinc-900">
            {latestRankings ? `#${latestRankings.rank}` : "—"}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <p className="text-sm text-zinc-500">日变化</p>
          <p className="mt-2 text-3xl font-semibold text-zinc-900">
            {latestRankings?.rankChange != null
              ? latestRankings.rankChange > 0
                ? `+${latestRankings.rankChange}`
                : latestRankings.rankChange
              : "—"}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <p className="text-sm text-zinc-500">AppID</p>
          <p className="mt-2 text-sm font-medium text-zinc-900">
            {game.appId ?? "未录入"}
          </p>
        </div>
      </div>

      <TrendChart
        data={trend}
        title={`${RANK_TYPE_LABELS[rankType]} · 排名趋势`}
      />
    </div>
  );
}
