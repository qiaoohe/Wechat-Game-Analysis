import { uiText } from "@/lib/ui-text";

interface RankLabelBadgesProps {
  labels: string[];
}

export function RankLabelBadges({ labels }: RankLabelBadgesProps) {
  if (labels.length === 0) return null;

  return (
    <div className="mt-1.5 flex flex-nowrap gap-1 overflow-hidden">
      {labels.map((label) => (
        <span
          key={label}
          className={
            label === "新上榜"
              ? "inline-flex shrink-0 items-center rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-amber-800 ring-1 ring-inset ring-amber-200"
              : "inline-flex shrink-0 items-center rounded-md bg-brand-soft px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-brand-text ring-1 ring-inset ring-brand-muted"
          }
          title={label}
        >
          {label}
        </span>
      ))}
    </div>
  );
}
