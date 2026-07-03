"use client";

import Image from "next/image";

import { cn } from "@/lib/utils";
import { resolveGameIconUrl } from "@/lib/utils/icon";

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
  const src = resolveGameIconUrl(iconUrl, name);
  const { box, px } = sizeMap[size];

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
        unoptimized
      />
    </div>
  );
}
