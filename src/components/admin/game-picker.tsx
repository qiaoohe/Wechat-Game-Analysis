"use client";

import { useEffect, useEffectEvent, useId, useRef, useState } from "react";
import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import type { GameRef } from "@/lib/reports/types";
import { cn } from "@/lib/utils";

interface SearchItem {
  id: number;
  name: string;
  publisher: string | null;
}

export interface PickedGame {
  id: number;
  name: string;
}

interface AdminGamePickerProps {
  label: string;
  platform: "wechat" | "douyin" | "both";
  value: PickedGame[];
  onChange: (next: PickedGame[]) => void;
  placeholder?: string;
}

function searchPlatform(platform: AdminGamePickerProps["platform"]) {
  return platform === "douyin" ? "douyin" : "wechat";
}

/** 从已存 GameRef 生成初始 chips（数字显示为 #id，字符串先当名称） */
export function refsToPicked(refs: GameRef[] | undefined): PickedGame[] {
  const out: PickedGame[] = [];
  const seen = new Set<number>();
  for (const ref of refs ?? []) {
    if (typeof ref === "number" || /^\d+$/.test(String(ref))) {
      const id = typeof ref === "number" ? ref : Number(ref);
      if (seen.has(id)) continue;
      seen.add(id);
      out.push({ id, name: `#${id}` });
    } else {
      // 名称暂用负 hash 占位，保存时仍会以名称解析；优先让用户重新点选
      const key = String(ref);
      const fakeId = -Math.abs(
        Array.from(key).reduce((a, c) => a + c.charCodeAt(0), 0),
      );
      if (seen.has(fakeId)) continue;
      seen.add(fakeId);
      out.push({ id: fakeId, name: key });
    }
  }
  return out;
}

export function pickedToRefs(picked: PickedGame[]): GameRef[] {
  return picked.map((p) => (p.id > 0 ? p.id : p.name));
}

export function AdminGamePicker({
  label,
  platform,
  value,
  onChange,
  placeholder = "输入游戏名搜索并添加",
}: AdminGamePickerProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<SearchItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const runSearch = useEffectEvent(async (q: string) => {
    if (!q) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/games/search?q=${encodeURIComponent(q)}&limit=10&platform=${searchPlatform(platform)}`,
      );
      if (!res.ok) {
        setItems([]);
        return;
      }
      const data = (await res.json()) as { items?: SearchItem[] };
      setItems(data.items ?? []);
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
    }, 200);
    return () => window.clearTimeout(timer);
  }, [query, platform]);

  useEffect(() => {
    function onDocClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function addGame(item: SearchItem) {
    if (value.some((v) => v.id === item.id)) {
      setQuery("");
      setOpen(false);
      return;
    }
    onChange([...value, { id: item.id, name: item.name }]);
    setQuery("");
    setItems([]);
    setOpen(false);
  }

  function removeGame(id: number) {
    onChange(value.filter((v) => v.id !== id));
  }

  const selectedIds = new Set(value.map((v) => v.id));

  return (
    <div ref={rootRef} className="block text-sm">
      <span className="mb-1.5 block font-medium text-slate-700">{label}</span>

      {value.length > 0 ? (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {value.map((game) => (
            <span
              key={`${game.id}-${game.name}`}
              className="inline-flex max-w-full items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-800"
            >
              <span className="truncate">
                {game.name}
                {game.id > 0 ? (
                  <span className="ml-1 text-slate-400">#{game.id}</span>
                ) : null}
              </span>
              <button
                type="button"
                className="rounded p-0.5 text-slate-400 hover:bg-white hover:text-brand"
                onClick={() => removeGame(game.id)}
                aria-label={`移除 ${game.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      ) : null}

      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="pl-9"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          autoComplete="off"
        />

        {open && query.trim() ? (
          <div
            id={listId}
            className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
          >
            {loading ? (
              <p className="px-3 py-2 text-xs text-slate-500">搜索中…</p>
            ) : items.length === 0 ? (
              <p className="px-3 py-2 text-xs text-slate-500">未找到相关游戏</p>
            ) : (
              items.map((item) => {
                const added = selectedIds.has(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={added}
                    className={cn(
                      "flex w-full flex-col px-3 py-2 text-left transition-colors",
                      added
                        ? "cursor-default opacity-45"
                        : "hover:bg-brand-soft",
                    )}
                    onClick={() => addGame(item)}
                  >
                    <span className="text-sm font-medium text-slate-900">
                      {item.name}
                      <span className="ml-1.5 text-xs font-normal text-slate-400">
                        #{item.id}
                      </span>
                    </span>
                    <span className="text-xs text-slate-500">
                      {item.publisher || (added ? "已添加" : "点击添加")}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
