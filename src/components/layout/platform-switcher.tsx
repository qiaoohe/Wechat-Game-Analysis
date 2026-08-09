"use client";

import Link from "next/link";

import {
  PLATFORM_SWITCH_ITEMS,
  type SitePlatform,
} from "@/lib/nav";
import { cn } from "@/lib/utils";

interface PlatformSwitcherProps {
  platform: SitePlatform;
  className?: string;
  /** 切换后回调（如关闭移动端抽屉） */
  onNavigate?: () => void;
}

export function PlatformSwitcher({
  platform,
  className,
  onNavigate,
}: PlatformSwitcherProps) {
  return (
    <div
      role="navigation"
      aria-label="平台切换"
      className={cn(
        "inline-flex shrink-0 items-center rounded-lg bg-slate-100/90 p-0.5 ring-1 ring-inset ring-slate-200/80",
        className,
      )}
    >
      {PLATFORM_SWITCH_ITEMS.map((item) => {
        const active = platform === item.id;

        return (
          <Link
            key={item.id}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex items-center justify-center rounded-md px-2.5 py-1 text-xs font-medium transition-colors sm:px-3 sm:text-sm",
              active
                ? "bg-white font-semibold text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
