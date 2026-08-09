"use client";

import { useEffect } from "react";

/**
 * 从浏览器历史记录（bfcache）还原页面时强制刷新，
 * 避免看到抓数前的旧榜单快照。
 */
export function BfCacheRefresh() {
  useEffect(() => {
    function onPageShow(event: PageTransitionEvent) {
      if (event.persisted) {
        window.location.reload();
      }
    }

    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  return null;
}
