import Link from "next/link";

import { GameAvatar } from "@/components/shared/game-avatar";
import { RankChangeBadge } from "@/components/rankings/rank-change-badge";
import { Card, CardContent } from "@/components/ui/card";
import type { RisingGame } from "@/lib/types";

interface RisingTableProps {
  items: RisingGame[];
}

export function RisingTable({ items }: RisingTableProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-6 py-4 font-medium">游戏</th>
                <th className="px-6 py-4 font-medium">当前排名</th>
                <th className="px-6 py-4 font-medium">日变化</th>
                <th className="px-6 py-4 font-medium">7日变化</th>
                <th className="px-6 py-4 font-medium">连续上升</th>
                <th className="px-6 py-4 font-medium">增速分</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.gameId}
                  className="border-b border-slate-50 last:border-0 hover:bg-brand-soft/60"
                >
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
                        <p className="mt-1 text-xs text-slate-400">
                          {item.publisher ?? "未知发行商"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    #{item.currentRank}
                  </td>
                  <td className="px-6 py-4">
                    <RankChangeBadge change={item.dailyChange} />
                  </td>
                  <td className="px-6 py-4">
                    <RankChangeBadge change={item.weeklyChange} />
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {item.consecutiveDaysUp} 天
                  </td>
                  <td className="px-6 py-4 font-semibold text-brand-text">
                    {item.risingScore.toFixed(1)}
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
