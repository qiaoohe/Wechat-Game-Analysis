"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn, linkHoverClass } from "@/lib/utils";

const sortOptions = [
  { value: "4", label: "上升最快" },
  { value: "3", label: "行业最热" },
] as const;

export function IpTrendSortTabs({ activeSort }: { activeSort: string }) {
  const pathname = usePathname();

  return (
    <div className="inline-flex rounded-xl border border-zinc-200 bg-zinc-50 p-1">
      {sortOptions.map((option) => {
        const href = `${pathname}?sort=${option.value}`;
        const active = activeSort === option.value;

        return (
          <Link
            key={option.value}
            href={href}
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-white font-semibold text-brand ring-1 ring-inset ring-brand-muted"
                : cn("text-slate-600", linkHoverClass),
            )}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}
