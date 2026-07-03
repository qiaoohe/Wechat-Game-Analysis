import { cn } from "@/lib/utils";

interface EllipsisTextProps {
  children: string;
  lines?: 1 | 2;
  className?: string;
  title?: string;
}

/** 超出 max lines 时显示省略号，hover 可看完整 title */
export function EllipsisText({
  children,
  lines = 1,
  className,
  title,
}: EllipsisTextProps) {
  const fullTitle = title ?? children;

  return (
    <span
      className={cn(
        "block min-w-0 overflow-hidden text-ellipsis",
        lines === 1
          ? "truncate whitespace-nowrap"
          : "line-clamp-2 whitespace-normal break-all",
        className,
      )}
      title={fullTitle}
    >
      {children}
    </span>
  );
}
