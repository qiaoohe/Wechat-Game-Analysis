import { ArrowDown, ArrowUp, Minus, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RankChangeBadgeProps {
  change: number | null;
  isNew?: boolean;
  className?: string;
}

export function RankChangeBadge({
  change,
  isNew = false,
  className,
}: RankChangeBadgeProps) {
  if (isNew) {
    return (
      <Badge variant="warning" className={cn("gap-1", className)}>
        <Sparkles className="h-3 w-3" />
        新上榜
      </Badge>
    );
  }

  if (change === null || change === 0) {
    return (
      <Badge variant="outline" className={cn("gap-1", className)}>
        <Minus className="h-3 w-3" />
        持平
      </Badge>
    );
  }

  if (change > 0) {
    return (
      <Badge variant="success" className={cn("gap-1", className)}>
        <ArrowUp className="h-3 w-3" />
        +{change}
      </Badge>
    );
  }

  return (
    <Badge variant="danger" className={cn("gap-1", className)}>
      <ArrowDown className="h-3 w-3" />
      {change}
    </Badge>
  );
}
