import { cn } from "@/lib/utils";

interface RankTableShellProps {
  children: React.ReactNode;
  className?: string;
}

/** 榜单表格：100% 宽、固定列布局，内容超出在单元格内省略 */
export function RankTableShell({ children, className }: RankTableShellProps) {
  return (
    <div
      className={cn(
        "w-full overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      <table className="w-full min-w-0 table-fixed text-left text-sm">{children}</table>
    </div>
  );
}

export function RankTableHead({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <thead>
      <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-medium text-slate-500 md:text-[13px]">
        {children}
      </tr>
    </thead>
  );
}

export function RankTableBody({
  children,
}: {
  children: React.ReactNode;
}) {
  return <tbody className="divide-y divide-slate-50">{children}</tbody>;
}

export function RankTableRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <tr className={cn("transition-colors hover:bg-brand-soft/50", className)}>
      {children}
    </tr>
  );
}

export function RankTableCell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={cn("px-3 py-2.5 align-middle sm:px-4 sm:py-3 md:px-5 md:py-3.5", className)}>
      {children}
    </td>
  );
}

export function RankTableHeaderCell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        "px-3 py-2.5 text-left text-[11px] font-medium whitespace-nowrap sm:px-4 sm:py-3 sm:text-xs md:px-5",
        className,
      )}
    >
      {children}
    </th>
  );
}
