"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, LogOut, Plus, Trash2 } from "lucide-react";

import {
  AdminGamePicker,
  pickedToRefs,
  refsToPicked,
  type PickedGame,
} from "@/components/admin/game-picker";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select } from "@/components/ui/input";
import { BrandIconMark } from "@/lib/brand-icon";
import type { ClientReportConfig, GameRef, ReportKind } from "@/lib/reports/types";
import { BRAND_NAME } from "@/lib/site-seo";
import { cn } from "@/lib/utils";

function emptyForm(): ClientReportConfig {
  return {
    clientId: "",
    clientName: "",
    platform: "wechat",
    rankType: "bestseller",
    watchGames: [],
    competitors: [],
    notes: "",
  };
}

async function hydratePicked(refs: GameRef[] | undefined): Promise<PickedGame[]> {
  const base = refsToPicked(refs);
  const ids = base.filter((p) => p.id > 0).map((p) => p.id);
  if (ids.length === 0) return base;

  try {
    const res = await fetch(`/api/games/batch?ids=${ids.join(",")}`);
    if (!res.ok) return base;
    const data = (await res.json()) as {
      items?: Array<{ id: number; name: string }>;
    };
    const nameMap = new Map(
      (data.items ?? []).map((item) => [item.id, item.name]),
    );
    return base.map((p) =>
      p.id > 0 && nameMap.has(p.id)
        ? { id: p.id, name: nameMap.get(p.id)! }
        : p,
    );
  } catch {
    return base;
  }
}

interface AdminDashboardProps {
  usingDefaults: boolean;
  username: string;
}

export function AdminDashboard({ usingDefaults, username }: AdminDashboardProps) {
  const router = useRouter();
  const [clients, setClients] = useState<ClientReportConfig[]>([]);
  const [form, setForm] = useState<ClientReportConfig>(emptyForm());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [watchPicks, setWatchPicks] = useState<PickedGame[]>([]);
  const [compPicks, setCompPicks] = useState<PickedGame[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const loadClients = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/clients", { cache: "no-store" });
      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }
      if (!res.ok) return;
      const data = (await res.json()) as { clients?: ClientReportConfig[] };
      setClients(data.clients ?? []);
    } catch {
      // 保留现有列表，避免刷新失败把左侧清空
    }
  }, [router]);

  useEffect(() => {
    void loadClients();
  }, [loadClients]);

  function mergeClientIntoList(client: ClientReportConfig) {
    setClients((prev) => {
      const rest = prev.filter((c) => c.clientId !== client.clientId);
      return [client, ...rest];
    });
  }

  async function selectClient(client: ClientReportConfig) {
    setSelectedId(client.clientId);
    setForm({
      clientId: client.clientId,
      clientName: client.clientName,
      platform: client.platform ?? "wechat",
      rankType: client.rankType ?? "bestseller",
      watchGames: client.watchGames ?? [],
      competitors: client.competitors ?? [],
      notes: client.notes ?? "",
    });
    const [watch, comps] = await Promise.all([
      hydratePicked(client.watchGames),
      hydratePicked(client.competitors),
    ]);
    setWatchPicks(watch);
    setCompPicks(comps);
    setMessage(`已载入客户：${client.clientName}`);
    setError("");
  }

  function resetForm() {
    setSelectedId(null);
    setForm(emptyForm());
    setWatchPicks([]);
    setCompPicks([]);
    setMessage("新建客户");
    setError("");
  }

  function buildConfigFromForm(): ClientReportConfig {
    return {
      ...form,
      clientId: form.clientId.trim(),
      clientName: form.clientName.trim(),
      watchGames: pickedToRefs(watchPicks),
      competitors: pickedToRefs(compPicks),
    };
  }

  async function onSave(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const config = buildConfigFromForm();
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
        cache: "no-store",
      });
      const data = (await res.json()) as {
        error?: string;
        client?: ClientReportConfig;
      };
      if (!res.ok) {
        setError(data.error || "保存失败");
        return;
      }
      const saved = data.client ?? config;
      setMessage(`已保存：${saved.clientName}`);
      // 先本地插入/更新左侧列表，再后台刷新，避免列表「看起来没更新」
      mergeClientIntoList(saved);
      setSelectedId(saved.clientId);
      await selectClient(saved);
      await loadClients();
    } catch {
      setError("保存失败");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(clientId: string) {
    if (!window.confirm(`确认删除客户 ${clientId}？`)) return;
    setBusy(true);
    try {
      const res = await fetch(
        `/api/admin/clients?clientId=${encodeURIComponent(clientId)}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        setError("删除失败");
        return;
      }
      if (selectedId === clientId || form.clientId === clientId) {
        resetForm();
      }
      setMessage("已删除");
      await loadClients();
    } finally {
      setBusy(false);
    }
  }

  async function onGenerate(kind: ReportKind) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const config = buildConfigFromForm();
      if (!config.clientId || !config.clientName) {
        setError("请先填写客户 ID 与名称");
        return;
      }
      if (
        (config.watchGames?.length ?? 0) === 0 &&
        (config.competitors?.length ?? 0) === 0
      ) {
        setMessage("提示：未添加关注/竞品，报告将只有市场概览部分");
      } else {
        setMessage("正在生成 Word 报告…");
      }
      const res = await fetch("/api/admin/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config, kind }),
      });
      const data = (await res.json()) as {
        error?: string;
        filename?: string;
        base64?: string;
        mime?: string;
      };
      if (!res.ok || !data.base64 || !data.filename) {
        setError(data.error || "生成失败");
        setMessage("");
        return;
      }

      const binary = atob(data.base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], {
        type:
          data.mime ||
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename;
      a.click();
      URL.revokeObjectURL(url);
      setMessage(`已下载 ${data.filename}`);
    } catch {
      setError("生成 Word 失败，请重试");
      setMessage("");
    } finally {
      setBusy(false);
    }
  }

  async function onLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  const pickerPlatform = form.platform ?? "wechat";

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <BrandIconMark size={28} radius={6} fontSize={15} />
          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              {BRAND_NAME} 管理后台
            </h1>
            <p className="text-xs text-slate-500">已登录：{username}</p>
          </div>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onLogout}>
          <LogOut className="h-4 w-4" />
          退出
        </Button>
      </header>

      {usingDefaults ? (
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          当前使用默认账号密码（admin / momorank2026）。上线前请在环境变量配置
          ADMIN_USERNAME、ADMIN_PASSWORD、ADMIN_SESSION_SECRET。
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.4fr]">
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-900">客户列表</h2>
            <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
              <Plus className="h-4 w-4" />
              新建
            </Button>
          </div>
          <ul className="mt-4 space-y-2">
            {clients.length === 0 ? (
              <li className="py-6 text-center text-sm text-slate-500">
                暂无客户，右侧创建后保存
              </li>
            ) : (
              clients.map((client) => {
                const active = selectedId === client.clientId;
                return (
                  <li key={client.clientId}>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => void selectClient(client)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          void selectClient(client);
                        }
                      }}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-xl px-3 py-3 transition-colors",
                        active
                          ? "bg-brand-soft ring-1 ring-brand-muted"
                          : "bg-slate-50 hover:bg-slate-100",
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "truncate text-sm font-medium",
                            active ? "text-brand-text" : "text-slate-900",
                          )}
                        >
                          {client.clientName}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {client.clientId} · {client.platform ?? "wechat"}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-white hover:text-brand"
                        onClick={(event) => {
                          event.stopPropagation();
                          void onDelete(client.clientId);
                        }}
                        aria-label={`删除 ${client.clientName}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-slate-900">
            客户配置与报告生成
            {selectedId ? (
              <span className="ml-2 text-xs font-normal text-slate-500">
                编辑中
              </span>
            ) : (
              <span className="ml-2 text-xs font-normal text-slate-500">
                新建
              </span>
            )}
          </h2>
          <form onSubmit={onSave} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium text-slate-700">
                  客户 ID（英文）
                </span>
                <Input
                  value={form.clientId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, clientId: e.target.value }))
                  }
                  placeholder="acme"
                  required
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium text-slate-700">
                  客户名称
                </span>
                <Input
                  value={form.clientName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, clientName: e.target.value }))
                  }
                  placeholder="某某互娱"
                  required
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium text-slate-700">
                  平台
                </span>
                <Select
                  value={form.platform ?? "wechat"}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      platform: e.target.value as ClientReportConfig["platform"],
                    }))
                  }
                >
                  <option value="wechat">微信单端</option>
                  <option value="douyin">抖音单端</option>
                  <option value="both">双端</option>
                </Select>
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium text-slate-700">
                  主榜类型
                </span>
                <Select
                  value={form.rankType ?? "bestseller"}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, rankType: e.target.value }))
                  }
                >
                  <option value="bestseller">畅销榜</option>
                  <option value="popular">人气/热门榜</option>
                  <option value="most_played">畅玩榜（微信）</option>
                  <option value="new_game">新游榜（抖音）</option>
                  <option value="publisher_heat">发行人热度（抖音）</option>
                </Select>
              </label>
            </div>

            <AdminGamePicker
              label="关注游戏"
              platform={pickerPlatform}
              value={watchPicks}
              onChange={setWatchPicks}
              placeholder="搜索游戏名，点击添加"
            />
            <AdminGamePicker
              label="竞品游戏"
              platform={pickerPlatform}
              value={compPicks}
              onChange={setCompPicks}
              placeholder="搜索竞品名，点击添加"
            />

            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-slate-700">备注</span>
              <Textarea
                value={form.notes ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                rows={3}
                className="min-h-[80px] border-slate-200"
                placeholder="单端试点等"
              />
            </label>

            {error ? <p className="text-sm text-brand-text">{error}</p> : null}
            {message ? <p className="text-sm text-slate-600">{message}</p> : null}

            <div className="flex flex-wrap gap-2 pt-1">
              <Button type="submit" disabled={busy}>
                保存客户
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => onGenerate("daily")}
              >
                <Download className="h-4 w-4" />
                生成日报 Word
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => onGenerate("weekly")}
              >
                <Download className="h-4 w-4" />
                生成周报 Word
              </Button>
            </div>
            <p className={cn("text-xs leading-5 text-slate-500")}>
              直接搜索添加关注/竞品，无需复制 ID。生成前建议先点「保存客户」。
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}
