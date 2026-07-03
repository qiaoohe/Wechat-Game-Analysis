import { cn } from "@/lib/utils";

interface RankSectionHeaderProps {
  title: string;
  action?: React.ReactNode;
  className?: string;
}

export function RankSectionHeader({
  title,
  action,
  className,
}: RankSectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-4 flex items-center justify-between gap-3",
        className,
      )}
    >
      <h2 className="text-base font-semibold whitespace-nowrap text-slate-900 sm:text-lg">
        {title}
      </h2>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

interface RankToolbarProps {
  children: React.ReactNode;
  className?: string;
}

export function RankToolbar({ children, className }: RankToolbarProps) {
  return (
    <div
      className={cn(
        "mb-4 flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white p-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between sm:p-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
