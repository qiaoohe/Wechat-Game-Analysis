import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { EllipsisText } from "@/components/shared/ellipsis-text";
import type { IpTrendItem } from "@/lib/types";
import { uiText } from "@/lib/ui-text";
import { cn } from "@/lib/utils";
import { resolveGameIconUrl } from "@/lib/utils/icon";

function RankBadge({ rank }: { rank: number }) {
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

function ChangePill({ value }: { value: number }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium tabular-nums",
        value > 0
          ? "bg-emerald-50 text-emerald-700"
          : value < 0
            ? "bg-red-50 text-red-600"
            : "bg-slate-100 text-slate-500",
      )}
    >
      {value > 0 ? "+" : ""}
      {value.toLocaleString("zh-CN")}
    </span>
  );
}

interface IpTrendMobileListProps {
  items: IpTrendItem[];
}

/** IP 热度 · 移动端卡片列表 */
export function IpTrendMobileList({ items }: IpTrendMobileListProps) {
  return (
    <ul className="divide-y divide-slate-100">
      {items.map((item) => (
        <li key={item.id}>
          <div className="active:bg-slate-50">
            <div className="flex items-center gap-3 px-4 py-3.5">
              <RankBadge rank={item.rank} />
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                <Image
                  src={resolveGameIconUrl(item.iconUrl, item.name)}
                  alt={item.name}
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              </div>
              <div className="min-w-0 flex-1">
                <EllipsisText className="font-medium text-slate-900">
                  {item.name}
                </EllipsisText>
                {item.description ? (
                  <EllipsisText
                    lines={1}
                    className="mt-0.5 text-xs text-slate-500"
                    title={item.description}
                  >
                    {item.description}
                  </EllipsisText>
                ) : null}
              </div>
              <div className={cn("shrink-0 text-right", uiText.num)}>
                <p className="text-sm font-semibold leading-5 text-slate-900">
                  {item.wxIndexLabel}
                </p>
                <div className="mt-1 flex justify-end">
                  <ChangePill value={item.wxIndexChange} />
                </div>
              </div>
            </div>

            {item.tags.length > 0 ? (
              <div className="flex gap-1.5 overflow-x-auto px-4 pb-3.5 pl-[4.75rem] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {item.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="shrink-0 text-[11px]"
                    title={tag}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
