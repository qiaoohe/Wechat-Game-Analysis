import Link from "next/link";

import { GameAvatar } from "@/components/shared/game-avatar";
import { RankChangeBadge } from "@/components/rankings/rank-change-badge";
import { Card, CardContent } from "@/components/ui/card";
import type { RankEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

interface RankTableProps {
  items: RankEntry[];
  showPublisher?: boolean;
  className?: string;
}

export function RankTable({
  items,
  showPublisher = true,
  className,
}: RankTableProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-6 py-4 font-medium">排名</th>
                <th className="px-6 py-4 font-medium">游戏</th>
                {showPublisher ? (
                  <th className="px-6 py-4 font-medium">发行商</th>
                ) : null}
                <th className="px-6 py-4 font-medium">品类</th>
                <th className="px-6 py-4 font-medium">变化</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.gameId}
                  className="border-b border-slate-50 transition-colors last:border-0 hover:bg-brand-soft/60"
                >
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold",
                        item.rank <= 3
                          ? "bg-brand font-semibold text-brand-foreground"
                          : "bg-slate-100 text-slate-700",
                      )}
                    >
                      {item.rank}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <GameAvatar
                        name={item.name}
                        iconUrl={item.iconUrl}
                        size="sm"
                      />
                      <div>
                        <Link
                          href={`/games/${item.gameId}`}
                          className="font-medium text-slate-900 hover:text-brand-text"
                        >
                          {item.name}
                        </Link>
                        {item.appId ? (
                          <p className="mt-1 text-xs text-slate-400">{item.appId}</p>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  {showPublisher ? (
                    <td className="px-6 py-4 text-slate-600">
                      {item.publisher ?? "—"}
                    </td>
                  ) : null}
                  <td className="px-6 py-4 text-slate-600">
                    {item.category ?? "—"}
                  </td>
                  <td className="px-6 py-4">
                    <RankChangeBadge
                      change={item.rankChange}
                      isNew={item.isNew}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
