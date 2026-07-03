import { ArrowDown, ArrowUp, Minus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { NewRankBadge } from "@/components/rankings/new-rank-badge";
import { cn } from "@/lib/utils";

interface RankChangeBadgeProps {
  change: number | null;
  isNew?: boolean;
  compact?: boolean;
  className?: string;
}

export function RankChangeBadge({
  change,
  isNew = false,
  compact = false,
  className,
}: RankChangeBadgeProps) {
  const badgeClass = compact
    ? "gap-0.5 px-1.5 py-0.5 text-[11px] leading-none"
    : "gap-1";
  const iconClass = compact ? "h-2.5 w-2.5" : "h-3 w-3";

  const wrap = (node: React.ReactNode) => (
    <div className={cn("mx-auto w-fit max-w-full", className)}>{node}</div>
  );

  if (isNew) {
    return wrap(<NewRankBadge />);
  }

  if (change === null || change === 0) {
    return wrap(
      <Badge variant="outline" className={badgeClass}>
        <Minus className={iconClass} />
        持平
      </Badge>,
    );
  }

  if (change > 0) {
    return wrap(
      <Badge variant="success" className={badgeClass}>
        <ArrowUp className={iconClass} />
        +{change}
      </Badge>,
    );
  }

  return wrap(
    <Badge variant="danger" className={badgeClass}>
      <ArrowDown className={iconClass} />
      {change}
    </Badge>,
  );
}
