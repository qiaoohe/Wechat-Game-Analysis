"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { MobileNavMenu } from "@/components/layout/mobile-nav-menu";
import { SITE_NAME_ZH } from "@/lib/site-seo";
import { cn, linkHoverClass } from "@/lib/utils";

const navItems = [
  { href: "/", label: "概览" },
  { href: "/rankings", label: "榜单" },
  { href: "/rising", label: "增速" },
  { href: "/insights/hot-words", label: "热搜词" },
  { href: "/insights/hot-search", label: "热搜访问" },
  { href: "/insights/ip-trends", label: "IP 热度" },
];

function isNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-2.5 md:flex-none">
            <span
              className="h-3.5 w-3.5 shrink-0 rounded-md bg-brand sm:h-4 sm:w-4"
              aria-hidden
            />
            <p className="truncate text-sm font-semibold text-slate-900 sm:text-base">
              {SITE_NAME_ZH}
            </p>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const active = isNavActive(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-brand-soft font-semibold text-brand ring-1 ring-inset ring-brand-muted"
                      : cn("text-slate-600 hover:bg-brand-soft", linkHoverClass),
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <MobileNavMenu />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
