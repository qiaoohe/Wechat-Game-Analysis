import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  className?: string;
}

export function StatCard({ label, value, hint, className }: StatCardProps) {
  return (
    <Card className={cn("border-zinc-200/80", className)}>
      <CardContent className="p-6">
        <p className="text-sm text-zinc-500">{label}</p>
        <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">
          {value}
        </p>
        {hint ? <p className="mt-2 text-xs text-zinc-400">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
