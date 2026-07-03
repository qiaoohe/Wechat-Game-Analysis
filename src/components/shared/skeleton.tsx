import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-200/70", className)}
      aria-hidden
    />
  );
}

export function SkeletonLine({ className }: { className?: string }) {
  return <Skeleton className={cn("h-4", className)} />;
}

export function SkeletonCircle({ className }: { className?: string }) {
  return <Skeleton className={cn("rounded-full", className)} />;
}
