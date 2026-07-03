import { cn, linkHoverClass } from "@/lib/utils";

interface TabsProps {
  children: React.ReactNode;
  className?: string;
}

export function tabTriggerClassName(active = false) {
  return cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:py-2 sm:text-sm",
    active
      ? "bg-brand-soft font-semibold text-brand ring-1 ring-inset ring-brand-muted"
      : cn("text-slate-600 hover:bg-white/80", linkHoverClass),
  );
}

export function Tabs({ children, className }: TabsProps) {
  return (
    <div
      className={cn(
        "flex w-full max-w-full overflow-x-auto rounded-xl border border-slate-200/80 bg-slate-50/80 p-1 [-ms-overflow-style:none] [scrollbar-width:none] md:inline-flex md:w-auto [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {children}
    </div>
  );
}
