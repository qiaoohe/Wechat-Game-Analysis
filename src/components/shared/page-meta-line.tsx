import { uiText } from "@/lib/ui-text";
import { cn } from "@/lib/utils";

interface PageMetaLineProps {
  items: string[];
  className?: string;
}

/** Inline page metadata (日期、条数等)，每项保持单行不换行 */
export function PageMetaLine({ items, className }: PageMetaLineProps) {
  return (
    <div
      className={cn(
        "mb-4 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 sm:mb-5 sm:gap-x-4 sm:text-sm",
        className,
      )}
    >
      {items.map((item) => (
        <span key={item} className={uiText.label}>
          {item}
        </span>
      ))}
    </div>
  );
}
