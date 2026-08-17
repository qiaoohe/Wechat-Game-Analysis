import type { RankEntry, RisingGame } from "@/lib/types";

export type SignalLevel = "red" | "yellow" | "green";

export interface GameSignal {
  level: SignalLevel;
  /** 灯：红灯 / 黄灯 / 绿灯 */
  label: string;
  /** 一句话动作 */
  action: string;
}

export function describeChange(change: number | null | undefined) {
  if (change === null || change === undefined) return "暂无对比";
  if (change > 0) return `升 ${change}`;
  if (change < 0) return `降 ${Math.abs(change)}`;
  return "持平";
}

export function signalLabel(level: SignalLevel) {
  if (level === "red") return "红灯";
  if (level === "yellow") return "黄灯";
  return "绿灯";
}

/** 关注游戏：异动优先，输出灯 + 可执行动作 */
export function watchSignal(entry: RankEntry | null): GameSignal {
  if (!entry) {
    return {
      level: "yellow",
      label: "黄灯",
      action: "主榜未见，核对是否掉榜或榜类型是否匹配",
    };
  }
  const change = entry.rankChange;
  if (entry.isNew) {
    return {
      level: "red",
      label: "红灯",
      action: "新上榜，当日复盘来量与素材",
    };
  }
  if (change !== null && change >= 8) {
    return {
      level: "red",
      label: "红灯",
      action: "大涨，拆解投放/自然量并评估能否加码",
    };
  }
  if (change !== null && change <= -8) {
    return {
      level: "red",
      label: "红灯",
      action: "大跌，检查消耗、留存与竞品挤压",
    };
  }
  if (change !== null && Math.abs(change) >= 5) {
    return {
      level: "yellow",
      label: "黄灯",
      action: "波动偏大，盯紧明日是否延续",
    };
  }
  if (entry.rank <= 10) {
    return {
      level: "green",
      label: "绿灯",
      action: "稳住头部，例行监测即可",
    };
  }
  if (entry.rank <= 30) {
    return {
      level: "yellow",
      label: "黄灯",
      action: "腰部区间，结合题材窗口决定是否试投",
    };
  }
  return {
    level: "green",
    label: "绿灯",
    action: "平稳，例行监测",
  };
}

/** 竞品：威胁优先 */
export function competitorSignal(entry: RankEntry | null): GameSignal {
  if (!entry) {
    return {
      level: "green",
      label: "绿灯",
      action: "未进主榜，短期威胁低",
    };
  }
  const change = entry.rankChange;
  if (entry.isNew || (change !== null && change >= 5)) {
    return {
      level: "red",
      label: "红灯",
      action: "竞品活跃，抽样其素材与投放节奏",
    };
  }
  if (change !== null && change <= -5) {
    return {
      level: "yellow",
      label: "黄灯",
      action: "竞品走弱，可观察流量承接窗口",
    };
  }
  if (entry.rank <= 20) {
    return {
      level: "yellow",
      label: "黄灯",
      action: "头部竞品，保持对标",
    };
  }
  return {
    level: "green",
    label: "绿灯",
    action: "平稳，例行对标",
  };
}

/** @deprecated 兼容旧调用，优先用 watchSignal */
export function watchJudgement(entry: RankEntry | null) {
  return watchSignal(entry).action;
}

/** @deprecated 兼容旧调用，优先用 competitorSignal */
export function competitorJudgement(entry: RankEntry | null) {
  return competitorSignal(entry).action;
}

export interface TrackedAlert {
  kind: "watch" | "competitor";
  name: string;
  level: SignalLevel;
  line: string;
  /** 排序：红 > 黄 > 绿，同级按 |变化| */
  score: number;
}

function levelRank(level: SignalLevel) {
  if (level === "red") return 3;
  if (level === "yellow") return 2;
  return 1;
}

export function makeAlert(options: {
  kind: "watch" | "competitor";
  name: string;
  entry: RankEntry | null;
  signal: GameSignal;
}): TrackedAlert | null {
  const { kind, name, entry, signal } = options;
  // 绿灯且无显著变化不进「必看」
  if (signal.level === "green" && !entry?.isNew) {
    const change = entry?.rankChange;
    if (change === null || change === undefined || Math.abs(change) < 5) {
      return null;
    }
  }
  const change = entry?.rankChange ?? null;
  const prefix = kind === "watch" ? "关注" : "竞品";
  const rankPart = entry ? `第 ${entry.rank}` : "未上榜";
  const line = `【${signal.label}】${prefix}「${name}」${describeChange(change)}（${rankPart}）→ ${signal.action}`;
  return {
    kind,
    name,
    level: signal.level,
    line,
    score: levelRank(signal.level) * 100 + Math.abs(change ?? 0),
  };
}

/** 今日必看：名单异动优先，市场只补 1 条 */
export function buildDecisionDigest(options: {
  watchAlerts: TrackedAlert[];
  competitorAlerts: TrackedAlert[];
  rising: RisingGame[];
  newcomers: RankEntry[];
  kind?: "daily" | "weekly";
}): string[] {
  const merged = [...options.watchAlerts, ...options.competitorAlerts].sort(
    (a, b) => b.score - a.score,
  );

  const lines = merged.slice(0, 4).map((a) => a.line);

  if (lines.length < 5 && options.newcomers.length > 0) {
    const names = options.newcomers
      .slice(0, 2)
      .map((i) => i.name)
      .join("、");
    lines.push(
      `市场：新上榜 ${options.newcomers.length} 款（${names}），留意是否与你们题材重合`,
    );
  } else if (lines.length < 5 && options.rising[0]) {
    const top = options.rising[0];
    const label = options.kind === "weekly" ? "本周市场" : "市场";
    lines.push(
      `${label}：${top.name} 势能靠前（第 ${top.currentRank}，${describeChange(options.kind === "weekly" ? top.weeklyChange : top.dailyChange)}）`,
    );
  }

  if (lines.length === 0) {
    lines.push(
      options.kind === "weekly"
        ? "本周名单与主榜波动有限，按例行周会复盘即可"
        : "今日名单与主榜波动有限，按例行监测即可",
    );
  }

  // 收尾动作（固定 1 条）
  const hasRed = merged.some((a) => a.level === "red");
  if (hasRed) {
    lines.push(
      "建议动作：优先处理全部红灯项，再决定是否调整当日投放",
    );
  } else if (merged.some((a) => a.level === "yellow")) {
    lines.push("建议动作：黄灯项明日复核一次，暂不必大幅调仓");
  }

  return lines.slice(0, 5);
}

export function buildDailyHighlights(options: {
  rising: RisingGame[];
  newcomers: RankEntry[];
  droppedCount: number;
  watchAlerts: string[];
  competitorAlerts: string[];
}) {
  // 旧接口保留：转为简版摘要（无灯级信息时）
  const lines: string[] = [];
  lines.push(...options.watchAlerts.slice(0, 3));
  lines.push(...options.competitorAlerts.slice(0, 2));
  if (options.newcomers.length > 0) {
    lines.push(`新上榜 ${options.newcomers.length} 款`);
  }
  if (lines.length === 0) {
    lines.push("今日主榜波动有限，建议按关注名单继续例行监测。");
  }
  return lines.slice(0, 5);
}

export function buildWeeklyHighlights(options: {
  rising: RisingGame[];
  hotWords: string[];
  ipNames: string[];
  focusAlerts?: TrackedAlert[];
}) {
  if (options.focusAlerts && options.focusAlerts.length > 0) {
    return buildDecisionDigest({
      watchAlerts: options.focusAlerts,
      competitorAlerts: [],
      rising: options.rising,
      newcomers: [],
      kind: "weekly",
    });
  }
  const lines: string[] = [];
  if (options.rising[0]) {
    lines.push(
      `本周势能：${options.rising[0].name}（7日 ${describeChange(options.rising[0].weeklyChange)}）`,
    );
  }
  if (options.hotWords.length > 0) {
    lines.push(`热搜集中：${options.hotWords.slice(0, 5).join("、")}`);
  }
  if (options.ipNames.length > 0) {
    lines.push(`IP 靠前：${options.ipNames.slice(0, 4).join("、")}`);
  }
  if (lines.length === 0) {
    lines.push("本周热点相对分散，结合关注名单做定向复盘。");
  }
  return lines.slice(0, 5);
}

/**
 * 周报「本周市场判断」：总榜浓缩成可汇报的 4～6 条硬指标，并扣回名单。
 */
export function buildWeeklyMarketJudgement(options: {
  rankLabel: string;
  date: string;
  rising: RisingGame[];
  newcomers: RankEntry[];
  dropped: Array<{ gameId: number; name: string; lastRank: number }>;
  watchIds: number[];
  watchNames: string[];
  competitorIds: number[];
  competitorNames: string[];
  hotWords: string[];
  ipNames: string[];
  redCount: number;
  yellowCount: number;
}): string[] {
  const lines: string[] = [];
  const focusIds = new Set([
    ...options.watchIds,
    ...options.competitorIds,
  ]);
  const focusNames = [...options.watchNames, ...options.competitorNames].filter(
    Boolean,
  );

  // 1) 势能
  const topUp = options.rising[0];

  if (topUp && (topUp.weeklyChange ?? 0) > 0) {
    lines.push(
      `势能：${topUp.name} 周变化靠前（第 ${topUp.currentRank}，7日 ${describeChange(topUp.weeklyChange)}）；主榜「${options.rankLabel}」。`,
    );
  } else {
    lines.push(
      `势能：截止 ${options.date}，「${options.rankLabel}」周波动有限，未见突出连升龙头。`,
    );
  }

  // 2) 进出
  const newN = options.newcomers.length;
  const dropN = options.dropped.length;
  const newNames = options.newcomers
    .slice(0, 2)
    .map((i) => i.name)
    .join("、");
  const dropNames = options.dropped
    .slice(0, 2)
    .map((i) => i.name)
    .join("、");
  if (newN > 0 || dropN > 0) {
    lines.push(
      `进出：新上榜 ${newN} 款${newNames ? `（${newNames}）` : ""}；掉榜 ${dropN} 款${dropNames ? `（${dropNames}）` : ""}。${
        newN >= 5 ? "题材/投放窗口仍偏活跃。" : "进出节奏可控。"
      }`,
    );
  } else {
    lines.push("进出：本周相对上一数据日无明显新上榜/掉榜记录。");
  }

  // 3) 与名单关系
  const risingHit = options.rising.filter((r) => focusIds.has(r.gameId));
  const newHit = options.newcomers.filter((i) => focusIds.has(i.gameId));
  const dropHit = options.dropped.filter((d) => focusIds.has(d.gameId));
  if (focusIds.size === 0) {
    lines.push(
      "与名单：尚未配置关注/竞品，市场判断仅供背景；建议补充 5～8 款核心名单。",
    );
  } else if (risingHit.length || newHit.length || dropHit.length) {
    const bits: string[] = [];
    if (risingHit[0]) {
      bits.push(
        `增速名单命中「${risingHit[0].name}」`,
      );
    }
    if (newHit[0]) bits.push(`新上榜命中「${newHit[0].name}」`);
    if (dropHit[0]) bits.push(`掉榜命中「${dropHit[0].name}」`);
    lines.push(
      `与名单：${bits.join("；")}——本周市场动能与你们监测盘有直接重合，建议优先复盘命中项。`,
    );
  } else {
    lines.push(
      `与名单：本周市场龙头/进出与关注·竞品无直接重合，名单可按例行监测，不必被全市场噪声带偏。`,
    );
  }

  // 4) 热搜 / IP 是否同向（简单：热词是否出现在名单或增速名中）
  const namePool = [
    ...focusNames,
    ...options.rising.slice(0, 8).map((r) => r.name),
  ];
  const hotOverlap = options.hotWords.filter((w) =>
    namePool.some((n) => n.includes(w) || (w.length >= 2 && w.includes(n))),
  );
  if (options.hotWords.length > 0 || options.ipNames.length > 0) {
    if (hotOverlap.length > 0) {
      lines.push(
        `热搜/IP：热词「${hotOverlap.slice(0, 3).join("、")}」与榜单或名单存在字面重合，素材/选题可对齐验证。`,
      );
    } else {
      lines.push(
        `热搜/IP：热词集中在「${options.hotWords.slice(0, 4).join("、") || "—"}」${
          options.ipNames[0] ? `；IP 代表「${options.ipNames.slice(0, 3).join("、")}」` : ""
        }。与当前名单字面重合弱，作题材雷达即可。`,
      );
    }
  }

  // 5) 名单灯况 + 下周看点
  if (focusIds.size > 0) {
    lines.push(
      `名单灯况：红灯 ${options.redCount} / 黄灯 ${options.yellowCount}。${
        options.redCount > 0
          ? "下周看点：红灯项是否延续，决定加码或收缩。"
          : options.yellowCount > 0
            ? "下周看点：黄灯项能否回到绿灯，避免误判为趋势。"
            : "下周看点：名单平稳，可抽 1 个市场题材做小预算测试。"
      }`,
    );
  } else if (topUp) {
    lines.push(
      `下周看点：跟踪「${topUp.name}」势能是否延续，并尽快补齐监测名单。`,
    );
  }

  return lines.slice(0, 6);
}

/** 7 日走势摘要：峰 / 谷 / 首尾 */
export function trendPeakValley(
  points: Array<{ date: string; rank: number }>,
): { text: string; best: number | null; worst: number | null } {
  const recent = points.slice(-7);
  if (recent.length === 0) {
    return { text: "暂无", best: null, worst: null };
  }
  let best = recent[0]!;
  let worst = recent[0]!;
  for (const p of recent) {
    if (p.rank < best.rank) best = p;
    if (p.rank > worst.rank) worst = p;
  }
  const first = recent[0]!;
  const last = recent[recent.length - 1]!;
  const text =
    recent.length === 1
      ? `${last.date.slice(5)}#${last.rank}`
      : `${first.date.slice(5)}#${first.rank}→#${last.rank}（最佳#${best.rank}）`;
  return { text, best: best.rank, worst: worst.rank };
}
