"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

const ANIMATION_MS = 300;

const navItems = [
  { href: "/", label: "概览", description: "数据概览与畅销榜 Top 10" },
  { href: "/rankings", label: "榜单", description: "畅销榜 · 人气榜 · 畅玩榜" },
  { href: "/rising", label: "增速", description: "排名快速上升的游戏" },
  { href: "/insights/hot-words", label: "热搜词", description: "用户搜索热词趋势" },
  { href: "/insights/hot-search", label: "热搜访问", description: "热搜词关联游戏访问" },
  { href: "/insights/ip-trends", label: "IP 热度", description: "合作 IP 热度趋势" },
];

function isNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function MobileNavMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(false);

  const close = () => setOpen(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setVisible(true);
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => setActive(true));
      });
      return () => cancelAnimationFrame(frame);
    }

    setActive(false);
    const timer = window.setTimeout(() => setVisible(false), ANIMATION_MS);
    return () => clearTimeout(timer);
  }, [open]);

  const drawer =
    visible && mounted
      ? createPortal(
          <div
            className={cn(
              "fixed inset-0 z-[100]",
              !active && "pointer-events-none",
            )}
            role="presentation"
          >
            <button
              type="button"
              aria-label="关闭菜单"
              tabIndex={active ? 0 : -1}
              className={cn(
                "mobile-nav-backdrop absolute inset-0 bg-slate-900/45",
                active ? "mobile-nav-backdrop-open" : "mobile-nav-backdrop-closed",
              )}
              onClick={close}
            />

            <nav
              aria-label="主导航"
              className={cn(
                "mobile-nav-panel absolute inset-y-0 right-0 flex w-[min(85vw,20rem)] flex-col bg-white shadow-2xl",
                active ? "mobile-nav-panel-open" : "mobile-nav-panel-closed",
              )}
              style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
            >
              <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 px-4">
                <p className="text-base font-semibold text-slate-900">菜单</p>
                <button
                  type="button"
                  aria-label="关闭菜单"
                  onClick={close}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain p-3">
                <ul className="space-y-1">
                  {navItems.map((item) => {
                    const isActive = isNavActive(pathname, item.href);

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={close}
                          className={cn(
                            "group block rounded-xl px-3 py-3 transition-colors active:bg-slate-50",
                            isActive
                              ? "bg-brand-soft ring-1 ring-inset ring-brand-muted"
                              : "hover:bg-slate-50",
                          )}
                        >
                          <p
                            className={cn(
                              "text-sm font-medium transition-colors",
                              isActive
                                ? "font-semibold text-brand"
                                : "text-slate-900 group-hover:text-brand",
                            )}
                          >
                            {item.label}
                          </p>
                          <p className="mt-0.5 text-xs leading-5 text-slate-500">
                            {item.description}
                          </p>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </nav>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label="打开菜单"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
      >
        <Menu className="h-5 w-5" />
      </button>
      {drawer}
    </div>
  );
}
