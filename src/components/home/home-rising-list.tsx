import Link from "next/link";

import { EllipsisText } from "@/components/shared/ellipsis-text";
import { GameAvatar } from "@/components/shared/game-avatar";
import type { RisingGame } from "@/lib/types";
import { uiText } from "@/lib/ui-text";
import { cn } from "@/lib/utils";

interface HomeRisingListProps {
  items: RisingGame[];
}

/** 首页增速榜 · 移动端卡片列表 */
export function HomeRisingList({ items }: HomeRisingListProps) {
  return (
    <ul className="divide-y divide-slate-100">
      {items.map((item, index) => (
        <li key={item.gameId}>
          <Link
            href={`/games/${item.gameId}`}
            className="group flex items-center gap-3 px-4 py-3.5 active:bg-slate-50"
          >
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-semibold text-slate-600 tabular-nums",
                uiText.num,
              )}
            >
              {index + 1}
            </span>
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
                当前 #{item.currentRank} · 日升 {item.dailyChange} 位
              </p>
            </div>
            <span className="shrink-0 rounded-lg bg-brand-soft px-2 py-1 text-xs font-semibold whitespace-nowrap text-brand-text tabular-nums">
              {item.risingScore.toFixed(1)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
