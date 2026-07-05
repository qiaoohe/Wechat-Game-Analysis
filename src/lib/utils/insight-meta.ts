import { getChinaTodayYmd } from "@/lib/fetchers/mp-client";

function formatChinaDateTime(iso: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

export function buildInsightMetaItems(options: {
  dataDate: string;
  countLabel: string;
  fetchedAt?: string;
  source?: "live" | "cache";
}) {
  const items = [
    `数据日期 ${options.dataDate || "—"}`,
    options.countLabel,
  ];

  if (options.fetchedAt) {
    items.push(`同步于 ${formatChinaDateTime(options.fetchedAt)}`);
  }

  if (
    options.dataDate &&
    options.dataDate < getChinaTodayYmd()
  ) {
    items.push("微信 MP 热搜统计通常比榜单晚 1 天");
  }

  if (options.source === "cache") {
    items.push("缓存数据（MP Cookie 失效时展示）");
  }

  return items;
}
