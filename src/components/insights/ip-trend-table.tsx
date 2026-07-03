import Image from "next/image";

import { IpTrendMobileList } from "@/components/insights/ip-trend-mobile-list";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { IpTrendItem } from "@/lib/types";
import { uiCol, uiText } from "@/lib/ui-text";
import { cn } from "@/lib/utils";
import { resolveGameIconUrl } from "@/lib/utils/icon";

interface IpTrendTableProps {
  items: IpTrendItem[];
}

function IpTrendDesktopTable({ items }: IpTrendTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-100 text-xs uppercase tracking-wide text-zinc-400">
            <th className={uiText.th}>排名</th>
            <th className={uiText.th}>合作 IP</th>
            <th className={uiText.th}>热度指数</th>
            <th className={uiText.th}>变化</th>
            <th className={uiText.th}>标签</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              className="border-b border-zinc-50 transition-colors hover:bg-zinc-50/80"
            >
              <td className={cn("px-6 py-4 font-semibold text-zinc-500", uiText.num)}>
                #{item.rank}
              </td>
              <td className="px-6 py-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
                    <Image
                      src={resolveGameIconUrl(item.iconUrl, item.name)}
                      alt={item.name}
                      width={56}
                      height={56}
                      className="h-full w-full object-cover"
                      unoptimized
                    />
                  </div>
                  <div className={cn("min-w-0", uiCol.gameName)}>
                    <p
                      className={cn("font-medium text-zinc-900", uiText.line1)}
                      title={item.name}
                    >
                      {item.name}
                    </p>
                    {item.description ? (
                      <p
                        className={cn("mt-1 text-xs text-zinc-500", uiText.line2)}
                        title={item.description}
                      >
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                </div>
              </td>
              <td className={cn("px-6 py-4 font-medium text-zinc-900", uiText.num)}>
                {item.wxIndexLabel}
              </td>
              <td className={cn("px-6 py-4", uiText.num)}>
                <span
                  className={cn(
                    "font-medium",
                    item.wxIndexChange > 0
                      ? "text-emerald-600"
                      : item.wxIndexChange < 0
                        ? "text-red-500"
                        : "text-zinc-400",
                  )}
                >
                  {item.wxIndexChange > 0 ? "+" : ""}
                  {item.wxIndexChange.toLocaleString("zh-CN")}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex max-w-[14rem] flex-nowrap gap-1 overflow-hidden">
                  {item.tags.slice(0, 4).map((tag) => (
                    <Badge key={tag} variant="outline" title={tag}>
                      {tag}
                    </Badge>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function IpTrendTable({ items }: IpTrendTableProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <>
      <Card className="overflow-hidden border-slate-200/80 md:hidden">
        <CardContent className="p-0">
          <IpTrendMobileList items={items} />
        </CardContent>
      </Card>

      <Card className="hidden overflow-hidden border-slate-200/80 md:block">
        <CardContent className="p-0">
          <IpTrendDesktopTable items={items} />
        </CardContent>
      </Card>
    </>
  );
}
