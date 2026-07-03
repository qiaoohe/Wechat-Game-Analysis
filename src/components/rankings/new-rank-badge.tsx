import { cn } from "@/lib/utils";

/** 「新上榜」统一标签样式（榜单标签列 + 排名变化列） */
export const newRankBadgeClass =
  "inline-flex shrink-0 items-center rounded-md bg-brand-soft px-2 py-1 text-[11px] font-medium leading-none whitespace-nowrap text-brand ring-1 ring-inset ring-brand-muted/70";

interface NewRankBadgeProps {
  className?: string;
}

export function NewRankBadge({ className }: NewRankBadgeProps) {
  return <span className={cn(newRankBadgeClass, className)}>新上榜</span>;
}
