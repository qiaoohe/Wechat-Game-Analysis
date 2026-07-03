import { Skeleton, SkeletonCircle, SkeletonLine } from "@/components/shared/skeleton";
import { cn } from "@/lib/utils";

type PageLoadingVariant = "default" | "list" | "detail";

interface PageLoadingProps {
  variant?: PageLoadingVariant;
  className?: string;
}

function HeaderSkeleton() {
  return (
    <div className="mb-5 sm:mb-8">
      <SkeletonLine className="h-7 w-40 sm:h-8 sm:w-48" />
      <SkeletonLine className="mt-3 h-4 w-full max-w-xl" />
      <SkeletonLine className="mt-2 h-4 w-2/3 max-w-md" />
    </div>
  );
}

function ToolbarSkeleton() {
  return (
    <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <Skeleton className="h-10 w-full rounded-xl md:w-72" />
      <Skeleton className="h-10 w-full rounded-lg md:w-44" />
    </div>
  );
}

function ListRowsSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white">
      <div className="hidden border-b border-slate-100 px-5 py-3 md:block">
        <div className="flex gap-8">
          <SkeletonLine className="h-3 w-10" />
          <SkeletonLine className="h-3 w-16" />
          <SkeletonLine className="h-3 w-24 flex-1" />
          <SkeletonLine className="h-3 w-10" />
        </div>
      </div>
      <ul className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, index) => (
          <li key={index} className="flex items-center gap-3 px-4 py-3.5">
            <Skeleton className="h-7 w-7 shrink-0 rounded-md" />
            <SkeletonCircle className="h-10 w-10 shrink-0" />
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonLine className="h-4 w-2/5" />
              <SkeletonLine className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-6 w-10 shrink-0 rounded-md" />
          </li>
        ))}
      </ul>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <div className="mb-4 grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-slate-200/80 bg-white p-4 sm:p-6"
          >
            <SkeletonLine className="h-3 w-20" />
            <SkeletonLine className="mt-3 h-8 w-28" />
            <SkeletonLine className="mt-3 h-3 w-32" />
          </div>
        ))}
      </div>
      <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white md:col-span-2 lg:col-span-2">
          <div className="border-b border-slate-100 px-4 py-3.5 sm:px-6 sm:py-4">
            <SkeletonLine className="h-5 w-36" />
          </div>
          <ListRowsSkeleton rows={6} />
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white md:col-span-2 lg:col-span-1">
          <div className="border-b border-slate-100 px-4 py-3.5 sm:px-6 sm:py-4">
            <SkeletonLine className="h-5 w-32" />
          </div>
          <ListRowsSkeleton rows={5} />
        </div>
      </div>
    </>
  );
}

function DetailSkeleton() {
  return (
    <>
      <SkeletonLine className="mb-4 h-4 w-20" />
      <div className="mb-6 rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-5">
            <SkeletonCircle className="h-12 w-12 shrink-0 sm:h-14 sm:w-14" />
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonLine className="h-7 w-48" />
              <SkeletonLine className="h-4 w-full max-w-lg" />
              <SkeletonLine className="h-4 w-2/3 max-w-sm" />
            </div>
          </div>
          <Skeleton className="h-10 w-full rounded-xl md:w-64" />
        </div>
      </div>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5",
              index === 2 && "col-span-2 lg:col-span-1",
            )}
          >
            <SkeletonLine className="h-3 w-16" />
            <SkeletonLine className="mt-3 h-8 w-20" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-slate-200/80 bg-white p-4 sm:p-6">
        <SkeletonLine className="mb-4 h-5 w-40" />
        <Skeleton className="h-56 w-full rounded-lg" />
      </div>
    </>
  );
}

/** 页面级 loading 骨架（路由切换时） */
export function PageLoading({
  variant = "list",
  className,
}: PageLoadingProps) {
  return (
    <div
      className={cn("page-loading-enter", className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="页面加载中"
    >
      <span className="sr-only">加载中…</span>
      <HeaderSkeleton />
      {variant === "default" ? <DashboardSkeleton /> : null}
      {variant === "list" ? (
        <>
          <ToolbarSkeleton />
          <SkeletonLine className="mb-4 h-3 w-56" />
          <ListRowsSkeleton />
        </>
      ) : null}
      {variant === "detail" ? <DetailSkeleton /> : null}
    </div>
  );
}

/** Tab / 日期选择器等局部 loading */
export function ToolbarLoadingFallback() {
  return <ToolbarSkeleton />;
}

export function MetaLineLoadingFallback() {
  return <SkeletonLine className="mb-4 h-3 w-56" />;
}

export function TabsLoadingFallback() {
  return <Skeleton className="h-10 w-full rounded-xl md:w-72" />;
}

export function DateSelectorLoadingFallback() {
  return <Skeleton className="h-10 w-full rounded-lg md:w-44" />;
}
