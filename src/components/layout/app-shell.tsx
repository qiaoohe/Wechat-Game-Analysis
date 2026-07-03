"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, LayoutDashboard, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "概览", icon: LayoutDashboard },
  { href: "/rankings/bestseller", label: "榜单", icon: BarChart3 },
  { href: "/rising", label: "增速", icon: TrendingUp },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo-header.png"
              alt="飞鱼科技"
              width={129}
              height={36}
              className="h-9 w-auto"
              priority
            />
            <div className="hidden border-l border-slate-200 pl-3 sm:block">
              <p className="text-sm font-semibold text-slate-900">微信小游戏榜单监测</p>
              <p className="text-xs text-slate-500">榜单 · 增速 · 趋势</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-brand-soft font-semibold text-brand ring-1 ring-inset ring-brand-muted"
                      : "text-slate-600 hover:bg-brand-soft hover:text-brand-text",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-7xl grid-cols-3">
          {navItems.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 py-3 text-xs font-medium",
                  active ? "font-semibold text-brand" : "text-slate-400",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-8 pb-24 md:pb-8">{children}</main>
    </div>
  );
}
