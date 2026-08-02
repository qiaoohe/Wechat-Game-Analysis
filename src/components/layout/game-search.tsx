"use client";

import { Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useState,
  useTransition,
  type KeyboardEvent,
} from "react";

import { GameAvatar } from "@/components/shared/game-avatar";
import { cn } from "@/lib/utils";

interface SearchItem {
  id: number;
  name: string;
  appId: string | null;
  iconUrl: string | null;
  category: string | null;
  publisher: string | null;
}

export function GameSearch({ className }: { className?: string }) {
  const router = useRouter();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [items, setItems] = useState<SearchItem[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [, startTransition] = useTransition();

  const runSearch = useEffectEvent(async (value: string) => {
    const q = value.trim();
    if (!q) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/games/search?q=${encodeURIComponent(q)}&limit=8`,
      );
      if (!response.ok) {
        setItems([]);
        return;
      }
      const data = (await response.json()) as { items?: SearchItem[] };
      setItems(data.items ?? []);
      setActiveIndex(-1);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = window.setTimeout(() => {
      void runSearch(q);
    }, 220);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function goToGame(id: number) {
    setOpen(false);
    setQuery("");
    setItems([]);
    startTransition(() => {
      router.push(`/games/${id}`);
    });
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!open && (event.key === "ArrowDown" || event.key === "Enter")) {
      setOpen(true);
    }

    if (event.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }

    if (!items.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % items.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? items.length - 1 : index - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const target = items[activeIndex] ?? items[0];
      if (target) goToGame(target.id);
    }
  }

  const showPanel = open && query.trim().length > 0;

  return (
    <div ref={rootRef} className={cn("relative w-full max-w-xs", className)}>
      <label className="sr-only" htmlFor={`${listId}-input`}>
        搜索小游戏/公司
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
        <input
          ref={inputRef}
          id={`${listId}-input`}
          type="text"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined
          }
          autoComplete="off"
          spellCheck={false}
          placeholder="搜索小游戏/公司"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/80 py-1.5 pl-8 pr-8 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-brand-muted focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-ring"
        />
        {query ? (
          <button
            type="button"
            aria-label="清空搜索"
            className="absolute right-1.5 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            onClick={() => {
              setQuery("");
              setItems([]);
              inputRef.current?.focus();
            }}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      {showPanel ? (
        <div
          id={listId}
          role="listbox"
          className="absolute right-0 left-0 top-[calc(100%+0.35rem)] z-[60] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-200/60"
        >
          {loading && items.length === 0 ? (
            <p className="px-3 py-3 text-sm text-slate-500">搜索中…</p>
          ) : items.length === 0 ? (
            <p className="px-3 py-3 text-sm text-slate-500">未找到相关小游戏/公司</p>
          ) : (
            <ul className="max-h-[min(24rem,70vh)] overflow-y-auto py-1">
              {items.map((item, index) => {
                const active = index === activeIndex;
                return (
                  <li key={item.id} role="option" aria-selected={active}>
                    <Link
                      id={`${listId}-option-${index}`}
                      href={`/games/${item.id}`}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 transition-colors",
                        active ? "bg-brand-soft" : "hover:bg-slate-50",
                      )}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={(event) => {
                        event.preventDefault();
                        goToGame(item.id);
                      }}
                    >
                      <GameAvatar
                        name={item.name}
                        iconUrl={item.iconUrl}
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {item.name}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {[item.publisher, item.category]
                            .filter(Boolean)
                            .join(" · ") || "微信小游戏"}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
