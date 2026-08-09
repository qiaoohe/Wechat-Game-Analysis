"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import {
  getGameIconFallback,
  isDouyinDirectIconUrl,
  resolveGameIconUrl,
} from "@/lib/utils/icon";

interface GameAvatarProps {
  name: string;
  iconUrl?: string | null;
  size?: "sm" | "md" | "rank" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { box: "h-8 w-8", px: 32 },
  md: { box: "h-10 w-10", px: 40 },
  /** 榜单行：与游戏名 + 标签行等高 */
  rank: { box: "h-12 w-12", px: 48 },
  lg: { box: "h-14 w-14", px: 56 },
};

export function GameAvatar({
  name,
  iconUrl,
  size = "md",
  className,
}: GameAvatarProps) {
  const resolved = resolveGameIconUrl(iconUrl, name);
  const fallback = getGameIconFallback(name);
  const [src, setSrc] = useState(resolved);
  const { box, px } = sizeMap[size];
  // 抖音签名 CDN 对服务端/Image Optimizer 回源不稳定，浏览器直连更可靠
  const unoptimized =
    Boolean(iconUrl && isDouyinDirectIconUrl(iconUrl)) ||
    src === fallback ||
    src.startsWith("https://api.dicebear.com/");

  useEffect(() => {
    setSrc(resolved);
  }, [resolved]);

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-50",
        box,
        className,
      )}
    >
      <Image
        src={src}
        alt={name}
        width={px}
        height={px}
        className="h-full w-full object-cover"
        loading="lazy"
        unoptimized={unoptimized}
        onError={() => {
          if (src !== fallback) setSrc(fallback);
        }}
      />
    </div>
  );
}
