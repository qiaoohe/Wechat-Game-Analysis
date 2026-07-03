import { EllipsisText } from "@/components/shared/ellipsis-text";
import { GameAvatar } from "@/components/shared/game-avatar";
import {
  RankTableBody,
  RankTableCell,
  RankTableHead,
  RankTableHeaderCell,
  RankTableRow,
  RankTableShell,
} from "@/components/rankings/rank-table-shell";
import { Card, CardContent } from "@/components/ui/card";
import type { HotSearchVisitItem } from "@/lib/types";
import { uiText } from "@/lib/ui-text";
import { cn } from "@/lib/utils";

interface HotSearchTableProps {
  items: HotSearchVisitItem[];
}

export function HotSearchTable({ items }: HotSearchTableProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <Card className="overflow-hidden border-slate-200/80">
      <CardContent className="p-0">
        <RankTableShell>
          <colgroup>
            <col style={{ width: "64px" }} />
            <col style={{ width: "34%" }} />
            <col />
          </colgroup>
          <RankTableHead>
            <RankTableHeaderCell>排名</RankTableHeaderCell>
            <RankTableHeaderCell>游戏</RankTableHeaderCell>
            <RankTableHeaderCell>简介</RankTableHeaderCell>
          </RankTableHead>
          <RankTableBody>
            {items.map((item) => (
              <RankTableRow key={`${item.rank}-${item.appId}`}>
                <RankTableCell className={cn("font-semibold text-zinc-500", uiText.num)}>
                  #{item.rank}
                </RankTableCell>
                <RankTableCell>
                  <div className="flex min-w-0 items-center gap-3">
                    <GameAvatar name={item.name} iconUrl={item.iconUrl} />
                    <div className="min-w-0 flex-1">
                      <EllipsisText className="font-medium text-zinc-900">
                        {item.name}
                      </EllipsisText>
                      <EllipsisText className="mt-0.5 text-xs text-zinc-400">
                        {item.appId}
                      </EllipsisText>
                    </div>
                  </div>
                </RankTableCell>
                <RankTableCell className="text-zinc-600">
                  <EllipsisText lines={2} className="text-[13px] leading-5">
                    {item.description ?? "—"}
                  </EllipsisText>
                </RankTableCell>
              </RankTableRow>
            ))}
          </RankTableBody>
        </RankTableShell>
      </CardContent>
    </Card>
  );
}
