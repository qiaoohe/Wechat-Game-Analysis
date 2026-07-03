import { uiText } from "@/lib/ui-text";
import { newRankBadgeClass } from "@/components/rankings/new-rank-badge";
import { cn } from "@/lib/utils";

interface RankLabelBadgesProps {
  labels: string[];
}

const rankLabelBadgeClass =
  "inline-flex shrink-0 items-center rounded-md bg-brand-soft px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-brand-text ring-1 ring-inset ring-brand-muted";

export function RankLabelBadges({ labels }: RankLabelBadgesProps) {
  if (labels.length === 0) return null;

  return (
    <div className={cn("mt-1.5 flex flex-nowrap gap-1 overflow-hidden", uiText.label)}>
      {labels.map((label) => (
        <span
          key={label}
          className={label === "新上榜" ? newRankBadgeClass : rankLabelBadgeClass}
          title={label}
        >
          {label}
        </span>
      ))}
    </div>
  );
}
