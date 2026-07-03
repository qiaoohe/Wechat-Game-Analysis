"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn, mutedLinkClass } from "@/lib/utils";

interface IpTrendPaginationProps {
  page: number;
  totalPages: number;
  sort: string;
}

function pageHref(pathname: string, sort: string, page: number) {
  const params = new URLSearchParams({ sort });
  if (page > 1) {
    params.set("page", String(page));
  }
  return `${pathname}?${params.toString()}`;
}

export function IpTrendPagination({
  page,
  totalPages,
  sort,
}: IpTrendPaginationProps) {
  const pathname = usePathname();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm"
      aria-label="IP 列表分页"
    >
      {page > 1 ? (
        <Link
          href={pageHref(pathname, sort, page - 1)}
          className={cn(
            "rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-600 transition-colors hover:border-brand-muted hover:bg-brand-soft hover:text-brand",
            mutedLinkClass,
          )}
        >
          上一页
        </Link>
      ) : null}

      <span className="text-slate-500">
        第 {page} / {totalPages} 页
      </span>

      {page < totalPages ? (
        <Link
          href={pageHref(pathname, sort, page + 1)}
          className={cn(
            "rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-600 transition-colors hover:border-brand-muted hover:bg-brand-soft hover:text-brand",
            mutedLinkClass,
          )}
        >
          下一页
        </Link>
      ) : null}
    </nav>
  );
}
