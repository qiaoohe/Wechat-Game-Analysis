import Link from "next/link";

import { EllipsisText } from "@/components/shared/ellipsis-text";
import { GameAvatar } from "@/components/shared/game-avatar";
import { RankChangeBadge } from "@/components/rankings/rank-change-badge";
import { RankLabelBadges } from "@/components/rankings/rank-label-badges";
import { RankMobileList } from "@/components/rankings/rank-mobile-list";
import {
  RankTableBody,
  RankTableCell,
  RankTableHead,
  RankTableHeaderCell,
  RankTableRow,
  RankTableShell,
} from "@/components/rankings/rank-table-shell";
import { Card, CardContent } from "@/components/ui/card";
import type { RankEntry } from "@/lib/types";
import { uiText } from "@/lib/ui-text";
import { cn, textLinkClass } from "@/lib/utils";

interface RankTableProps {
  items: RankEntry[];
  className?: string;
  /** 嵌入父级 Card，不再套一层边框 */
  embedded?: boolean;
}

function RankNumber({ rank }: { rank: number }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded-md px-1 text-xs font-semibold tabular-nums md:h-8 md:min-w-8 md:rounded-lg md:px-1.5 md:text-sm",
        rank <= 3
          ? "bg-brand text-brand-foreground"
          : "bg-slate-100 text-slate-700",
      )}
    >
      {rank}
    </span>
  );
}

/** 桌面端表格（md+） */
export function RankTableDesktop({ items }: { items: RankEntry[] }) {
  return (
    <RankTableShell>
      <colgroup>
        <col style={{ width: "56px" }} />
        <col style={{ width: "36%" }} />
        <col />
        <col style={{ width: "88px" }} />
      </colgroup>
      <RankTableHead>
        <RankTableHeaderCell>排名</RankTableHeaderCell>
        <RankTableHeaderCell>游戏</RankTableHeaderCell>
        <RankTableHeaderCell className="hidden md:table-cell">简介</RankTableHeaderCell>
        <RankTableHeaderCell className="text-center">变化</RankTableHeaderCell>
      </RankTableHead>
      <RankTableBody>
        {items.map((item) => {
          const description = item.category?.trim() || "—";
          const hasMpNewLabel = item.rankLabels.includes("新上榜");

          return (
            <RankTableRow key={item.gameId}>
              <RankTableCell className={cn("w-14 shrink-0", uiText.num)}>
                <RankNumber rank={item.rank} />
              </RankTableCell>
              <RankTableCell className="overflow-hidden">
                <div className="flex min-w-0 items-start gap-3">
                  <GameAvatar
                    name={item.name}
                    iconUrl={item.iconUrl}
                    size="rank"
                    className="!h-10 !w-10 md:!h-12 md:!w-12"
                  />
                  <div className="min-w-0 flex-1 pt-0.5">
                    <Link
                      href={`/games/${item.gameId}`}
                      className={cn("block leading-5", textLinkClass)}
                    >
                      <EllipsisText>{item.name}</EllipsisText>
                    </Link>
                    <RankLabelBadges labels={item.rankLabels} />
                  </div>
                </div>
              </RankTableCell>
              <RankTableCell className="hidden overflow-hidden text-slate-500 md:table-cell">
                <EllipsisText className="text-[13px] leading-5">
                  {description}
                </EllipsisText>
              </RankTableCell>
              <RankTableCell className="overflow-hidden text-center">
                <RankChangeBadge
                  change={item.rankChange}
                  isNew={item.isNew && !hasMpNewLabel}
                  compact
                />
              </RankTableCell>
            </RankTableRow>
          );
        })}
      </RankTableBody>
    </RankTableShell>
  );
}

export function RankTable({ items, className, embedded = false }: RankTableProps) {
  if (items.length === 0) {
    return null;
  }

  if (embedded) {
    return (
      <div className={className}>
        <div className="md:hidden">
          <RankMobileList items={items} />
        </div>
        <div className="hidden md:block">
          <RankTableDesktop items={items} />
        </div>
      </div>
    );
  }

  return (
    <>
      <Card
        className={cn(
          "overflow-hidden border-slate-200/80 md:hidden",
          className,
        )}
      >
        <CardContent className="p-0">
          <RankMobileList items={items} />
        </CardContent>
      </Card>
      <Card
        className={cn(
          "hidden overflow-hidden border-slate-200/80 md:block",
          className,
        )}
      >
        <CardContent className="p-0">
          <RankTableDesktop items={items} />
        </CardContent>
      </Card>
    </>
  );
}
