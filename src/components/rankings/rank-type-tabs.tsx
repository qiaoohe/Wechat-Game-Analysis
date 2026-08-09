"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { Tabs, tabTriggerClassName } from "@/components/ui/tabs";
import { RANK_TYPES, RANK_TYPE_LABELS, type RankType } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface RankTypeTabsProps<T extends string = RankType> {
  activeType: T;
  mode?: "path" | "query";
  basePath?: string;
  /** 自定义榜类型（如抖音）；默认微信 RANK_TYPES */
  types?: readonly T[];
  labels?: Record<T, string>;
}

export function RankTypeTabs<T extends string = RankType>({
  activeType,
  mode = "path",
  basePath,
  types,
  labels,
}: RankTypeTabsProps<T>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const date = searchParams.get("date");
  const rankTypes = types ?? (RANK_TYPES as unknown as readonly T[]);
  const rankLabels =
    labels ?? (RANK_TYPE_LABELS as unknown as Record<T, string>);

  return (
    <Tabs>
      {rankTypes.map((type) => {
        let href = "";
        if (mode === "query") {
          const params = new URLSearchParams(searchParams.toString());
          params.set("type", type);
          href = `${pathname}?${params.toString()}`;
        } else {
          const hrefBase = basePath
            ? `${basePath.replace(/\/$/, "")}/${type}`
            : `/rankings/${type}`;
          href = date ? `${hrefBase}?date=${date}` : hrefBase;
        }

        return (
          <Link
            key={type}
            href={href}
            className={cn(
              tabTriggerClassName(activeType === type),
              "flex-1 md:flex-none",
            )}
          >
            {rankLabels[type] ?? type}
          </Link>
        );
      })}
    </Tabs>
  );
}
