/** MP rank_badge_info → 展示标签（与热点创意工具一致） */
export interface RankBadgeInfo {
  is_new_rank?: boolean;
  consecutive_days?: number;
  rank_change_value?: number;
}

export function formatConsecutiveDays(days: number): string {
  if (days <= 7) return `${days}天`;
  if (days <= 31) return "超1周";
  if (days <= 180) return "超1月";
  if (days <= 365) return "超半年";
  return "超1年";
}

/** 从 MP rank_badge_info 生成榜单标签 */
export function buildRankLabels(badge?: RankBadgeInfo | null): string[] {
  if (!badge) return [];

  const labels: string[] = [];

  if (badge.is_new_rank) {
    labels.push("新上榜");
    return labels;
  }

  if (badge.consecutive_days && badge.consecutive_days > 0) {
    labels.push(`上榜Top10 ${formatConsecutiveDays(badge.consecutive_days)}`);
  }

  return labels;
}

export function parseRankLabelsJson(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}
