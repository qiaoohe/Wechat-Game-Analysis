import Link from "next/link";

import { EllipsisText } from "@/components/shared/ellipsis-text";
import { GameAvatar } from "@/components/shared/game-avatar";
import { RankChangeBadge } from "@/components/rankings/rank-change-badge";
import { RankNumber } from "@/components/rankings/rank-mobile-list";
import type { RisingGame } from "@/lib/types";
import { uiText } from "@/lib/ui-text";
import { cn } from "@/lib/utils";

interface RisingMobileListProps {
  items: RisingGame[];
  /** 如「畅销榜」，用于副标题区分增速排名与主榜排名 */
  rankTypeLabel: string;
}

/** 增速榜 · 移动端卡片列表（布局对齐榜单页 RankMobileList） */
export function RisingMobileList({ items, rankTypeLabel }: RisingMobileListProps) {
  return (
    <ul className="divide-y divide-slate-100">
      {items.map((item, index) => (
        <li key={item.gameId}>
          <Link
            href={`/games/${item.gameId}`}
            className="group flex items-center gap-3 px-4 py-3.5 active:bg-slate-50"
          >
            <RankNumber rank={index + 1} />
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
              <p className={cn("mt-1 text-xs text-slate-500", uiText.label)}>
                {rankTypeLabel} #{item.currentRank}
                {item.consecutiveDaysUp > 0 ? (
                  <>
                    {" "}
                    · 连升{" "}
                    <span className={cn("tabular-nums", uiText.num)}>
                      {item.consecutiveDaysUp}
                    </span>{" "}
                    天
                  </>
                ) : null}
              </p>
            </div>
            <div className="shrink-0">
              <RankChangeBadge change={item.weeklyChange} compact />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
