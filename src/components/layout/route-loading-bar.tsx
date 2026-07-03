"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

/** 路由切换时顶部进度条 */
export function RouteLoadingBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(true);
    const timer = window.setTimeout(() => setActive(false), 700);
    return () => window.clearTimeout(timer);
  }, [pathname, search]);

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 overflow-hidden bg-transparent",
      )}
      aria-hidden
    >
      <div
        className={cn(
          "route-loading-bar h-full bg-brand",
          active && "route-loading-bar-active",
        )}
      />
    </div>
  );
}
