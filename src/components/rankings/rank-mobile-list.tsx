import Link from "next/link";

import { EllipsisText } from "@/components/shared/ellipsis-text";
import { GameAvatar } from "@/components/shared/game-avatar";
import { GamePublisherText } from "@/components/shared/game-publisher-text";
import { RankChangeBadge } from "@/components/rankings/rank-change-badge";
import { RankLabelBadges } from "@/components/rankings/rank-label-badges";
import { formatPublisher } from "@/lib/services/publisher-service";
import type { RankEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

export function RankNumber({ rank }: { rank: number }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded-md px-1 text-xs font-semibold tabular-nums",
        rank <= 3
          ? "bg-brand text-brand-foreground"
          : "bg-slate-100 text-slate-700",
      )}
    >
      {rank}
    </span>
  );
}

interface RankMobileListProps {
  items: RankEntry[];
  /** 游戏详情路径前缀，默认微信 /games */
  gameHrefPrefix?: string;
}

/** 榜单 · 移动端卡片列表 */
export function RankMobileList({
  items,
  gameHrefPrefix = "/games",
}: RankMobileListProps) {
  const prefix = gameHrefPrefix.replace(/\/$/, "");

  return (
    <ul className="divide-y divide-slate-100">
      {items.map((item) => {
        const hasMpNewLabel = item.rankLabels.includes("新上榜");
        const publisher = formatPublisher(item.publisher);
        const hasLabels = item.rankLabels.length > 0;

        return (
          <li key={item.gameId}>
            <Link
              href={`${prefix}/${item.gameId}`}
              className="group flex items-center gap-3 px-4 py-3.5 active:bg-slate-50"
            >
              <RankNumber rank={item.rank} />
              <GameAvatar
                name={item.name}
                iconUrl={item.iconUrl}
                size="rank"
                className="!h-10 !w-10 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <EllipsisText className="font-medium text-slate-900 transition-colors group-hover:text-brand">
                  {item.name}
                </EllipsisText>
                {publisher || hasLabels ? (
                  <div className="mt-0.5 flex min-w-0 items-center gap-1.5 overflow-hidden">
                    {hasLabels ? (
                      <RankLabelBadges
                        labels={item.rankLabels}
                        className="mt-0 shrink-0"
                      />
                    ) : null}
                    {publisher ? (
                      <GamePublisherText
                        publisher={item.publisher}
                        className="mt-0 min-w-0"
                      />
                    ) : null}
                  </div>
                ) : null}
              </div>
              <div className="shrink-0">
                <RankChangeBadge
                  change={item.rankChange}
                  isNew={item.isNew && !hasMpNewLabel}
                  compact
                />
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
