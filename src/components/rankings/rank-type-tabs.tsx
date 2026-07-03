"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { Tabs, tabTriggerClassName } from "@/components/ui/tabs";
import { RANK_TYPES, RANK_TYPE_LABELS, type RankType } from "@/lib/constants";

interface RankTypeTabsProps {
  activeType: RankType;
  mode?: "path" | "query";
  basePath?: string;
}

export function RankTypeTabs({
  activeType,
  mode = "path",
  basePath,
}: RankTypeTabsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const date = searchParams.get("date");

  return (
    <Tabs>
      {RANK_TYPES.map((type) => {
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
            className={tabTriggerClassName(activeType === type)}
          >
            {RANK_TYPE_LABELS[type]}
          </Link>
        );
      })}
    </Tabs>
  );
}
