import Link from "next/link";

import { EllipsisText } from "@/components/shared/ellipsis-text";
import { GameAvatar } from "@/components/shared/game-avatar";
import { RankChangeBadge } from "@/components/rankings/rank-change-badge";
import { RisingMobileList } from "@/components/rankings/rising-mobile-list";
import {
  RankTableBody,
  RankTableCell,
  RankTableHead,
  RankTableHeaderCell,
  RankTableRow,
  RankTableShell,
} from "@/components/rankings/rank-table-shell";
import { Card, CardContent } from "@/components/ui/card";
import type { RisingGame } from "@/lib/types";
import { uiText } from "@/lib/ui-text";
import { cn, textLinkClass } from "@/lib/utils";

interface RisingTableProps {
  items: RisingGame[];
}

/** 增速榜 · 桌面端表格（md+） */
export function RisingTableDesktop({ items }: { items: RisingGame[] }) {
  return (
    <RankTableShell>
      <colgroup>
        <col />
        <col style={{ width: "96px" }} />
        <col style={{ width: "96px" }} />
        <col style={{ width: "96px" }} />
        <col style={{ width: "96px" }} />
        <col style={{ width: "80px" }} />
      </colgroup>
      <RankTableHead>
        <RankTableHeaderCell>游戏</RankTableHeaderCell>
        <RankTableHeaderCell className="text-center">当前排名</RankTableHeaderCell>
        <RankTableHeaderCell className="text-center">日变化</RankTableHeaderCell>
        <RankTableHeaderCell className="text-center">7日变化</RankTableHeaderCell>
        <RankTableHeaderCell className="text-center">连续上升</RankTableHeaderCell>
        <RankTableHeaderCell className="text-center">增速分</RankTableHeaderCell>
      </RankTableHead>
      <RankTableBody>
        {items.map((item) => (
          <RankTableRow key={item.gameId}>
            <RankTableCell>
              <div className="flex min-w-0 items-center gap-3">
                <GameAvatar
                  name={item.name}
                  iconUrl={item.iconUrl}
                  size="rank"
                  className="!h-10 !w-10 sm:!h-12 sm:!w-12"
                />
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/games/${item.gameId}`}
                    className={textLinkClass}
                  >
                    <EllipsisText>{item.name}</EllipsisText>
                  </Link>
                  {item.category ? (
                    <EllipsisText
                      lines={1}
                      className="mt-1 text-xs text-slate-400"
                    >
                      {item.category}
                    </EllipsisText>
                  ) : null}
                </div>
              </div>
            </RankTableCell>
            <RankTableCell className={cn("text-center font-semibold text-slate-900", uiText.num)}>
              #{item.currentRank}
            </RankTableCell>
            <RankTableCell className={cn("text-center", uiText.num)}>
              <RankChangeBadge change={item.dailyChange} compact />
            </RankTableCell>
            <RankTableCell className={cn("text-center", uiText.num)}>
              <RankChangeBadge change={item.weeklyChange} compact />
            </RankTableCell>
            <RankTableCell className={cn("text-center text-slate-600", uiText.num)}>
              {item.consecutiveDaysUp} 天
            </RankTableCell>
            <RankTableCell className={cn("text-center font-semibold text-brand-text", uiText.num)}>
              {item.risingScore.toFixed(1)}
            </RankTableCell>
          </RankTableRow>
        ))}
      </RankTableBody>
    </RankTableShell>
  );
}

export function RisingTable({ items }: RisingTableProps) {
  return (
    <>
      <Card className="overflow-hidden border-slate-200/80 md:hidden">
        <CardContent className="p-0">
          <RisingMobileList items={items} />
        </CardContent>
      </Card>
      <Card className="hidden overflow-hidden border-slate-200/80 md:block">
        <CardContent className="p-0">
          <RisingTableDesktop items={items} />
        </CardContent>
      </Card>
    </>
  );
}
