import { cn } from "@/lib/utils";

interface TabsProps {
  children: React.ReactNode;
  className?: string;
}

export function tabTriggerClassName(active = false) {
  return cn(
    "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors",
    active
      ? "bg-brand-soft font-semibold text-brand ring-1 ring-inset ring-brand-muted shadow-sm"
      : "text-slate-600 hover:bg-white/80 hover:text-brand-text",
  );
}

export function Tabs({ children, className }: TabsProps) {
  return (
    <div
      className={cn(
        "inline-flex rounded-xl border border-slate-200/80 bg-slate-50/80 p-1",
        className,
      )}
    >
      {children}
    </div>
  );
}
