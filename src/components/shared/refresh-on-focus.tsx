"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** 标签页隐藏超过阈值后再次可见时，向服务器拉取最新 RSC 数据 */
const MIN_HIDDEN_MS = 60_000;

export function RefreshOnFocus() {
  const router = useRouter();

  useEffect(() => {
    let hiddenAt = 0;

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        hiddenAt = Date.now();
        return;
      }

      if (
        hiddenAt > 0 &&
        document.visibilityState === "visible" &&
        Date.now() - hiddenAt >= MIN_HIDDEN_MS
      ) {
        router.refresh();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [router]);

  return null;
}
