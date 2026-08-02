import Link from "next/link";

import { RankChangeBadge } from "@/components/rankings/rank-change-badge";
import { RankLabelBadges } from "@/components/rankings/rank-label-badges";
import { EllipsisText } from "@/components/shared/ellipsis-text";
import { GameAvatar } from "@/components/shared/game-avatar";
import type { PublisherGameItem } from "@/lib/services/publisher-service";
import { uiText } from "@/lib/ui-text";
import { cn, textLinkClass } from "@/lib/utils";

interface PublisherGameListProps {
  items: PublisherGameItem[];
}

export function PublisherGameList({ items }: PublisherGameListProps) {
  if (items.length === 0) return null;

  return (
    <>
      <ul className="divide-y divide-slate-100 md:hidden">
        {items.map((item) => {
          const hasMpNewLabel = item.rankLabels.includes("新上榜");

          return (
            <li key={item.gameId}>
              <Link
                href={`/games/${item.gameId}`}
                className="group flex items-center gap-3 px-4 py-3.5 active:bg-slate-50"
              >
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
                  {item.rankLabels.length > 0 ? (
                    <div className="mt-1">
                      <RankLabelBadges
                        labels={item.rankLabels}
                        className="mt-0"
                      />
                    </div>
                  ) : item.category ? (
                    <EllipsisText
                      lines={1}
                      className="mt-0.5 text-xs text-slate-400"
                    >
                      {item.category}
                    </EllipsisText>
                  ) : null}
                </div>
                <div className="shrink-0 text-right">
                  <p
                    className={cn(
                      "text-sm font-semibold tabular-nums text-slate-900",
                      uiText.num,
                    )}
                  >
                    {item.rank != null ? `#${item.rank}` : "未上榜"}
                  </p>
                  {item.rank != null ? (
                    <div className="mt-1">
                      <RankChangeBadge
                        change={item.rankChange}
                        isNew={item.isNew && !hasMpNewLabel}
                        compact
                      />
                    </div>
                  ) : null}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full table-fixed text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs text-slate-500">
              <th className="px-5 py-3 font-medium sm:px-6">游戏</th>
              <th className="w-28 px-3 py-3 text-center font-medium">排名</th>
              <th className="w-28 px-3 py-3 text-center font-medium">变化</th>
              <th className="hidden px-5 py-3 font-medium lg:table-cell sm:px-6">
                简介
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {items.map((item) => {
              const hasMpNewLabel = item.rankLabels.includes("新上榜");
              const description = item.category?.trim() || "—";

              return (
                <tr key={item.gameId} className="hover:bg-slate-50/80">
                  <td className="px-5 py-3.5 sm:px-6">
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
                        {item.rankLabels.length > 0 ? (
                          <RankLabelBadges
                            labels={item.rankLabels}
                            className="mt-1"
                          />
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td
                    className={cn(
                      "px-3 py-3.5 text-center text-sm font-semibold tabular-nums text-slate-900",
                      uiText.num,
                    )}
                  >
                    {item.rank != null ? `#${item.rank}` : "—"}
                  </td>
                  <td className="px-3 py-3.5 text-center">
                    {item.rank != null ? (
                      <RankChangeBadge
                        change={item.rankChange}
                        isNew={item.isNew && !hasMpNewLabel}
                        compact
                      />
                    ) : (
                      <span className="text-xs text-slate-400">未上榜</span>
                    )}
                  </td>
                  <td className="hidden overflow-hidden px-5 py-3.5 text-slate-500 lg:table-cell sm:px-6">
                    <EllipsisText className="text-[13px] leading-5">
                      {description}
                    </EllipsisText>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
