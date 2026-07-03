import { Card, CardContent } from "@/components/ui/card";
import { uiText } from "@/lib/ui-text";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  className?: string;
}

export function StatCard({ label, value, hint, className }: StatCardProps) {
  return (
    <Card className={cn("border-slate-200/80", className)}>
      <CardContent className="p-4 sm:p-6">
        <p className={cn("text-xs text-slate-500 sm:text-sm", uiText.label)}>{label}</p>
        <p className="mt-2 truncate text-2xl font-semibold tracking-tight text-slate-900 sm:mt-3 sm:text-3xl">
          {value}
        </p>
        {hint ? (
          <p className={cn("mt-2 text-xs text-slate-400", uiText.line1)} title={hint}>
            {hint}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
