import { uiText } from "@/lib/ui-text";
import { newRankBadgeClass } from "@/components/rankings/new-rank-badge";
import { cn } from "@/lib/utils";

interface RankLabelBadgesProps {
  labels: string[];
  className?: string;
}

const rankLabelBadgeClass =
  "inline-flex shrink-0 items-center rounded-md bg-brand-soft px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-brand-text ring-1 ring-inset ring-brand-muted";

export function RankLabelBadges({ labels, className }: RankLabelBadgesProps) {
  const uniqueLabels = [...new Set(labels.map((label) => label.trim()).filter(Boolean))];
  if (uniqueLabels.length === 0) return null;

  return (
    <div
      className={cn(
        "mt-1.5 flex flex-nowrap gap-1 overflow-hidden",
        uiText.label,
        className,
      )}
    >
      {uniqueLabels.map((label, index) => (
        <span
          key={`${label}-${index}`}
          className={label === "新上榜" ? newRankBadgeClass : rankLabelBadgeClass}
          title={label}
        >
          {label}
        </span>
      ))}
    </div>
  );
}
