"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { RANK_TYPES, RANK_TYPE_LABELS, type RankType } from "@/lib/constants";
import { cn } from "@/lib/utils";

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
    <div className="inline-flex rounded-xl border border-zinc-200 bg-zinc-50 p-1">
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
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              activeType === type
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-900",
            )}
          >
            {RANK_TYPE_LABELS[type]}
          </Link>
        );
      })}
    </div>
  );
}
