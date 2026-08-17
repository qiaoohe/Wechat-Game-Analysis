import { RANK_TYPE_LABELS, type RankType } from "@/lib/constants";
import {
  DOUYIN_RANK_TYPE_LABELS,
  type DouyinRankType,
} from "@/lib/douyin";
import {
  getDroppedGames,
  getGameTrend,
  getLatestDate,
  getNewEntries,
  getRankings,
  getRisingGames,
} from "@/lib/services/rank-service";
import {
  getDouyinGameTrend,
  getDouyinRankings,
  getDouyinRisingGames,
  getDouyinAvailableDates,
} from "@/lib/services/douyin-rank-service";
import { getLatestInsightSnapshot } from "@/lib/services/insight-service";
import type { RankEntry, RisingGame } from "@/lib/types";

import {
  buildDecisionDigest,
  buildWeeklyHighlights,
  buildWeeklyMarketJudgement,
  competitorSignal,
  makeAlert,
  trendPeakValley,
  watchSignal,
  type TrackedAlert,
} from "./copy";
import { formatRankChange, joinBlocks, mdHeading, mdTable } from "./format";
import {
  packReportDocx,
  type DocSection,
  type ReportDocModel,
} from "./generate-docx";
import { resolveGameRefs, type ResolvedGame } from "./resolve-games";
import type { ClientReportConfig, ReportKind, ReportPlatform } from "./types";

const DEFAULT_WECHAT_RANK: RankType = "bestseller";
const DEFAULT_DOUYIN_RANK: DouyinRankType = "popular";

function resolvePlatform(config: ClientReportConfig): ReportPlatform {
  return config.platform ?? "wechat";
}

function wechatRankType(config: ClientReportConfig): RankType {
  const t = config.rankType;
  if (t === "bestseller" || t === "popular" || t === "most_played") return t;
  return DEFAULT_WECHAT_RANK;
}

function douyinRankType(config: ClientReportConfig): DouyinRankType {
  const t = config.rankType;
  if (
    t === "popular" ||
    t === "bestseller" ||
    t === "new_game" ||
    t === "publisher_heat"
  ) {
    return t;
  }
  return DEFAULT_DOUYIN_RANK;
}

function findInList(items: RankEntry[], gameId: number) {
  return items.find((item) => item.gameId === gameId) ?? null;
}

/** 报告封面用：2026-08-17 → 2026年8月17日；双端混合串原样保留 */
function formatDataDateLabel(date: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!m) return date;
  return `${m[1]}年${Number(m[2])}月${Number(m[3])}日`;
}

async function resolveReportDates(
  platform: ReportPlatform,
  preferred?: string,
): Promise<{ coverDate: string; wechatDate: string; douyinDate: string }> {
  if (preferred) {
    return {
      coverDate: preferred,
      wechatDate: preferred,
      douyinDate: preferred,
    };
  }

  const wechatDate = (await getLatestDate()) ?? "";
  const douyinDate = (await getDouyinAvailableDates())[0] ?? "";

  if (platform === "douyin") {
    return { coverDate: douyinDate, wechatDate, douyinDate };
  }
  if (platform === "wechat") {
    return { coverDate: wechatDate, wechatDate, douyinDate };
  }

  // 双端：封面展示两侧各自最新；内容仍按各端自己的最新日取数
  const coverDate =
    wechatDate && douyinDate && wechatDate !== douyinDate
      ? `微信 ${wechatDate} / 抖音 ${douyinDate}`
      : wechatDate || douyinDate;

  return { coverDate, wechatDate, douyinDate };
}

function platformLabel(platform: ReportPlatform) {
  if (platform === "both") return "微信 + 抖音";
  if (platform === "douyin") return "抖音小游戏";
  return "微信小游戏";
}

async function trackedRows(options: {
  games: ResolvedGame[];
  items: RankEntry[];
  getTrend: (id: number) => Promise<Array<{ date: string; rank: number }>>;
  mode: "watch" | "competitor";
  /** 关注游戏平均位次，用于竞品位差 */
  watchAvgRank?: number | null;
}) {
  const rows: string[][] = [];
  const alerts: TrackedAlert[] = [];
  const actions: string[] = [];

  for (const game of options.games) {
    const entry = findInList(options.items, game.id);
    const trend = await options.getTrend(game.id);
    const { text: trendSummary } = trendPeakValley(trend);
    const signal =
      options.mode === "watch"
        ? watchSignal(entry)
        : competitorSignal(entry);
    const change = entry?.rankChange ?? null;

    let gap = "—";
    if (
      options.mode === "competitor" &&
      entry &&
      options.watchAvgRank != null &&
      Number.isFinite(options.watchAvgRank)
    ) {
      const diff = Math.round(entry.rank - options.watchAvgRank);
      if (diff < 0) gap = `领先关注 ${Math.abs(diff)}`;
      else if (diff > 0) gap = `落后关注 ${diff}`;
      else gap = "与关注持平";
    }

    if (options.mode === "watch") {
      rows.push([
        signal.label,
        game.name,
        entry ? String(entry.rank) : "未上榜",
        entry ? formatRankChange(change) : "—",
        trendSummary,
        signal.action,
      ]);
    } else {
      rows.push([
        signal.label,
        game.name,
        entry ? String(entry.rank) : "未上榜",
        entry ? formatRankChange(change) : "—",
        gap,
        signal.action,
      ]);
    }

    const alert = makeAlert({
      kind: options.mode,
      name: game.name,
      entry,
      signal,
    });
    if (alert) alerts.push(alert);

    if (signal.level !== "green") {
      actions.push(`${game.name}：${signal.action}`);
    }
  }

  // 红灯在前
  rows.sort((a, b) => {
    const order = (label: string) =>
      label === "红灯" ? 0 : label === "黄灯" ? 1 : 2;
    return order(a[0]!) - order(b[0]!);
  });

  return { rows, alerts, actions };
}

async function buildWechatDailyModel(
  config: ClientReportConfig,
  date: string,
): Promise<{ sections: DocSection[]; highlights: string[]; unresolved: string[] }> {
  const rankType = wechatRankType(config);
  const label = RANK_TYPE_LABELS[rankType];
  const { items, previousDate } = await getRankings(rankType, date);
  const { items: rising } = await getRisingGames(rankType, date, 8);
  const newcomers = await getNewEntries(rankType, date);
  const dropped = await getDroppedGames(rankType, date);

  const watch = await resolveGameRefs(config.watchGames, "wechat");
  const comps = await resolveGameRefs(config.competitors, "wechat");

  const watchOnRank = watch.resolved
    .map((g) => findInList(items, g.id))
    .filter((e): e is RankEntry => Boolean(e));
  const watchAvgRank =
    watchOnRank.length > 0
      ? watchOnRank.reduce((s, e) => s + e.rank, 0) / watchOnRank.length
      : null;

  const watchTracked = await trackedRows({
    games: watch.resolved,
    items,
    getTrend: (id) => getGameTrend(id, rankType, 14),
    mode: "watch",
  });
  const compTracked = await trackedRows({
    games: comps.resolved,
    items,
    getTrend: (id) => getGameTrend(id, rankType, 14),
    mode: "competitor",
    watchAvgRank,
  });

  const highlights = buildDecisionDigest({
    watchAlerts: watchTracked.alerts,
    competitorAlerts: compTracked.alerts,
    rising,
    newcomers,
    kind: "daily",
  });

  const redWatch = watchTracked.rows.filter((r) => r[0] === "红灯").length;
  const yellowWatch = watchTracked.rows.filter((r) => r[0] === "黄灯").length;
  const redComp = compTracked.rows.filter((r) => r[0] === "红灯").length;

  const sections: DocSection[] = [
    {
      heading: "一、关注游戏",
      paragraphs: [
        watch.resolved.length > 0
          ? `监测 ${watch.resolved.length} 款 · 「${label}」· ${date}${previousDate ? `（对比 ${previousDate}）` : ""}。红灯 ${redWatch} / 黄灯 ${yellowWatch}。`
          : "尚未配置关注游戏。请在后台添加后重新生成。",
      ],
      table:
        watch.resolved.length > 0
          ? {
              headers: ["灯", "游戏", "名次", "日变化", "7日走势", "建议动作"],
              rows: watchTracked.rows,
            }
          : undefined,
      note:
        watch.unresolved.length > 0
          ? `未匹配：${watch.unresolved.join("、")}`
          : undefined,
    },
    {
      heading: "二、竞品雷达",
      paragraphs: [
        comps.resolved.length > 0
          ? `对标 ${comps.resolved.length} 款竞品。红灯 ${redComp} 款需优先关注。「位差」相对你们关注游戏今日平均名次。`
          : "尚未配置竞品。",
      ],
      table:
        comps.resolved.length > 0
          ? {
              headers: ["灯", "竞品", "名次", "日变化", "位差", "建议动作"],
              rows: compTracked.rows,
            }
          : undefined,
      note:
        comps.unresolved.length > 0
          ? `未匹配：${comps.unresolved.join("、")}`
          : undefined,
    },
    {
      heading: "三、市场附录",
      paragraphs: [
        `全市场仅作背景参考。新上榜 ${newcomers.length} · 掉榜 ${dropped.length}。`,
      ],
      table: {
        headers: ["游戏", "名次", "日变化", "7日变化"],
        rows: rising.slice(0, 6).map((item: RisingGame) => [
          item.name,
          String(item.currentRank),
          formatRankChange(item.dailyChange),
          formatRankChange(item.weeklyChange),
        ]),
      },
      bullets: [
        newcomers[0]
          ? `新上榜代表：${newcomers
              .slice(0, 3)
              .map((i) => `${i.name}(#${i.rank})`)
              .join("、")}`
          : "今日无显著新上榜。",
        ...(watchTracked.actions.length > 0 || compTracked.actions.length > 0
          ? [
              `名单待办：${[...watchTracked.actions, ...compTracked.actions]
                .slice(0, 3)
                .join("；")}`,
            ]
          : ["名单整体平稳，无需额外动作。"]),
      ],
    },
  ];

  return {
    sections,
    highlights,
    unresolved: [...watch.unresolved, ...comps.unresolved],
  };
}

async function buildDouyinDailySections(
  config: ClientReportConfig,
  date: string,
): Promise<{ sections: DocSection[]; highlights: string[] }> {
  const rankType = douyinRankType(config);
  const label = DOUYIN_RANK_TYPE_LABELS[rankType];
  const { items } = await getDouyinRankings(rankType, date);
  const { items: rising } = await getDouyinRisingGames(rankType, date, 8);
  const watch = await resolveGameRefs(config.watchGames, "douyin");
  const comps = await resolveGameRefs(config.competitors, "douyin");

  const watchOnRank = watch.resolved
    .map((g) => findInList(items, g.id))
    .filter((e): e is RankEntry => Boolean(e));
  const watchAvgRank =
    watchOnRank.length > 0
      ? watchOnRank.reduce((s, e) => s + e.rank, 0) / watchOnRank.length
      : null;

  const watchTracked = await trackedRows({
    games: watch.resolved,
    items,
    getTrend: (id) => getDouyinGameTrend(id, rankType),
    mode: "watch",
  });
  const compTracked = await trackedRows({
    games: comps.resolved,
    items,
    getTrend: (id) => getDouyinGameTrend(id, rankType),
    mode: "competitor",
    watchAvgRank,
  });

  const highlights = buildDecisionDigest({
    watchAlerts: watchTracked.alerts,
    competitorAlerts: compTracked.alerts,
    rising,
    newcomers: [],
    kind: "daily",
  });

  const sections: DocSection[] = [
    {
      heading: "抖音 · 关注游戏",
      paragraphs: [
        watch.resolved.length > 0
          ? `数据日 ${date} · 「${label}」· 监测 ${watch.resolved.length} 款。`
          : "未配置或未匹配到抖音关注游戏。",
      ],
      table:
        watch.resolved.length > 0
          ? {
              headers: ["灯", "游戏", "名次", "日变化", "7日走势", "建议动作"],
              rows: watchTracked.rows,
            }
          : undefined,
    },
    {
      heading: "抖音 · 竞品雷达",
      table:
        comps.resolved.length > 0
          ? {
              headers: ["灯", "竞品", "名次", "日变化", "位差", "建议动作"],
              rows: compTracked.rows,
            }
          : undefined,
      paragraphs:
        comps.resolved.length === 0
          ? ["未配置或未匹配到抖音竞品。"]
          : undefined,
    },
    {
      heading: "抖音 · 市场附录",
      table: {
        headers: ["游戏", "名次", "日变化", "7日变化"],
        rows: rising.slice(0, 6).map((item) => [
          item.name,
          String(item.currentRank),
          formatRankChange(item.dailyChange),
          formatRankChange(item.weeklyChange),
        ]),
      },
    },
  ];

  return { sections, highlights };
}

async function buildWechatWeeklyModel(
  config: ClientReportConfig,
  date: string,
): Promise<{ sections: DocSection[]; highlights: string[] }> {
  const rankType = wechatRankType(config);
  const label = RANK_TYPE_LABELS[rankType];
  const { items } = await getRankings(rankType, date);
  const { items: rising } = await getRisingGames(rankType, date, 10);
  const newcomers = await getNewEntries(rankType, date);
  const dropped = await getDroppedGames(rankType, date);

  const watch = await resolveGameRefs(config.watchGames, "wechat");
  const comps = await resolveGameRefs(config.competitors, "wechat");

  const watchOnRank = watch.resolved
    .map((g) => findInList(items, g.id))
    .filter((e): e is RankEntry => Boolean(e));
  const watchAvgRank =
    watchOnRank.length > 0
      ? watchOnRank.reduce((s, e) => s + e.rank, 0) / watchOnRank.length
      : null;

  const watchTracked = await trackedRows({
    games: watch.resolved,
    items,
    getTrend: (id) => getGameTrend(id, rankType, 14),
    mode: "watch",
  });
  const compTracked = await trackedRows({
    games: comps.resolved,
    items,
    getTrend: (id) => getGameTrend(id, rankType, 14),
    mode: "competitor",
    watchAvgRank,
  });

  const hotWords = await getLatestInsightSnapshot("hot_words");
  const hotSearch = await getLatestInsightSnapshot("hot_search");
  const ipTrends = await getLatestInsightSnapshot("ip_trends");

  const hotWordNames =
    hotWords?.items.slice(0, 8).map((w) => w.name) ?? [];
  const ipNames =
    ipTrends?.items
      .slice(0, 8)
      .map((ip) => ip.ip_name)
      .filter((n): n is string => Boolean(n)) ?? [];

  const focusAlerts = [...watchTracked.alerts, ...compTracked.alerts];
  const highlights = buildWeeklyHighlights({
    rising,
    hotWords: hotWordNames,
    ipNames,
    focusAlerts,
  });

  const redCount = [...watchTracked.rows, ...compTracked.rows].filter(
    (r) => r[0] === "红灯",
  ).length;
  const yellowCount = [...watchTracked.rows, ...compTracked.rows].filter(
    (r) => r[0] === "黄灯",
  ).length;

  const marketJudgement = buildWeeklyMarketJudgement({
    rankLabel: label,
    date,
    rising,
    newcomers,
    dropped,
    watchIds: watch.resolved.map((g) => g.id),
    watchNames: watch.resolved.map((g) => g.name),
    competitorIds: comps.resolved.map((g) => g.id),
    competitorNames: comps.resolved.map((g) => g.name),
    hotWords: hotWordNames,
    ipNames,
    redCount,
    yellowCount,
  });

  const sections: DocSection[] = [
    {
      heading: "一、本周市场判断",
      paragraphs: [
        `基于「${label}」总榜与进出情况浓缩，供周会直接口述；详细表见后文章节。`,
      ],
      bullets: marketJudgement,
    },
    {
      heading: "二、关注游戏周走势",
      paragraphs: [
        watch.resolved.length > 0
          ? `截止 ${date}，监测 ${watch.resolved.length} 款关注游戏。`
          : "未配置关注游戏。",
      ],
      table:
        watch.resolved.length > 0
          ? {
              headers: ["灯", "游戏", "名次", "日变化", "7日走势", "建议动作"],
              rows: watchTracked.rows,
            }
          : undefined,
      note:
        watch.unresolved.length > 0
          ? `未匹配：${watch.unresolved.join("、")}`
          : undefined,
    },
    {
      heading: "三、竞品周雷达",
      table:
        comps.resolved.length > 0
          ? {
              headers: ["灯", "竞品", "名次", "日变化", "位差", "建议动作"],
              rows: compTracked.rows,
            }
          : undefined,
      paragraphs:
        comps.resolved.length === 0 ? ["未配置竞品。"] : undefined,
    },
    {
      heading: "四、热搜词 / IP",
      table: hotWords
        ? {
            headers: ["排名", "热搜词", "标记"],
            rows: hotWords.items.slice(0, 12).map((w) => [
              String(w.rank),
              w.name,
              [w.isNew ? "新" : "", w.isUp ? "升" : ""]
                .filter(Boolean)
                .join("/") || "—",
            ]),
          }
        : undefined,
      bullets: [
        hotWordNames.length
          ? `热词：${hotWordNames.slice(0, 6).join("、")}`
          : "暂无热搜词快照。",
        hotSearch
          ? `热搜访问：${hotSearch.items
              .slice(0, 4)
              .map((i) => i.name)
              .join("、")}`
          : undefined,
        ipNames.length
          ? `IP：${ipNames.slice(0, 5).join("、")}`
          : "暂无 IP 快照。",
      ].filter((b): b is string => Boolean(b)),
    },
    {
      heading: "五、市场附录",
      paragraphs: ["全市场增速仅作背景，开会不必逐条念。"],
      table: {
        headers: ["游戏", "名次", "日变化", "7日变化"],
        rows: rising.slice(0, 6).map((item) => [
          item.name,
          String(item.currentRank),
          formatRankChange(item.dailyChange),
          formatRankChange(item.weeklyChange),
        ]),
      },
    },
  ];

  if (ipTrends && ipTrends.items.length > 0) {
    sections.splice(4, 0, {
      heading: "IP 热度明细",
      table: {
        headers: ["排名", "IP", "指数", "变化"],
        rows: ipTrends.items.slice(0, 12).map((ip, index) => [
          String(index + 1),
          ip.ip_name ?? "—",
          ip.wxindex != null ? String(ip.wxindex) : "—",
          ip.wxindex_change != null ? String(ip.wxindex_change) : "—",
        ]),
      },
    });
  }

  return { sections, highlights };
}

export async function buildReportModel(options: {
  kind: ReportKind;
  config: ClientReportConfig;
  date?: string;
}): Promise<{ model: ReportDocModel; date: string; filename: string }> {
  const { kind, config } = options;
  const platform = resolvePlatform(config);

  const { coverDate, wechatDate, douyinDate } = await resolveReportDates(
    platform,
    options.date,
  );

  if (platform === "wechat" && !wechatDate) {
    throw new Error("无可用微信数据日期，请先执行榜单抓取");
  }
  if (platform === "douyin" && !douyinDate) {
    throw new Error("无可用抖音数据日期，请先执行榜单抓取");
  }
  if (platform === "both" && !wechatDate && !douyinDate) {
    throw new Error("无可用数据日期，请先执行榜单抓取");
  }

  const primaryDate =
    platform === "douyin" ? douyinDate : wechatDate || douyinDate;

  const kindLabel = kind === "daily" ? "日报" : "周报";
  const sections: DocSection[] = [];
  let highlights: string[] = [];

  if (kind === "daily") {
    if ((platform === "wechat" || platform === "both") && wechatDate) {
      const built = await buildWechatDailyModel(config, wechatDate);
      sections.push(...built.sections);
      highlights = built.highlights;
    }
    if ((platform === "douyin" || platform === "both") && douyinDate) {
      const dy = await buildDouyinDailySections(config, douyinDate);
      sections.push(...dy.sections);
      if (platform === "douyin" || highlights.length === 0) {
        highlights = dy.highlights;
      }
    }
  } else if (platform === "douyin") {
    const dy = await buildDouyinDailySections(config, douyinDate);
    sections.push(...dy.sections);
    highlights = dy.highlights;
  } else {
    if (wechatDate) {
      const built = await buildWechatWeeklyModel(config, wechatDate);
      sections.push(...built.sections);
      highlights = built.highlights;
    }
    if (platform === "both" && douyinDate) {
      const dy = await buildDouyinDailySections(config, douyinDate);
      sections.push(...dy.sections);
    }
  }

  const coverDateLabel = /^(\d{4})-(\d{2})-(\d{2})$/.test(coverDate)
    ? formatDataDateLabel(coverDate)
    : coverDate.includes(" / ")
      ? coverDate
          .split(" / ")
          .map((part) => {
            const [label, d] = part.split(" ");
            return d ? `${label} ${formatDataDateLabel(d)}` : part;
          })
          .join(" / ")
      : coverDate;

  const model: ReportDocModel = {
    title: `${config.clientName} · 小游戏${kindLabel}`,
    subtitle:
      kind === "daily"
        ? "今日必看 · 关注游戏 · 竞品雷达 · 市场附录"
        : "本周必看 · 市场判断 · 关注/竞品 · 热搜IP",
    meta: [
      `客户：${config.clientName}（${config.clientId}）`,
      `平台：${platformLabel(platform)}`,
      `数据日：${coverDateLabel}`,
      config.notes ? `备注：${config.notes}` : "",
    ].filter(Boolean),
    highlights,
    highlightTitle: kind === "daily" ? "今日必看" : "本周必看",
    sections,
    footerNote: "MomoRank 情报服务 · 仅供合作客户内部决策参考",
  };

  const filenameDate = primaryDate || coverDate.replace(/\s+/g, "");
  const filename = `${filenameDate}_${config.clientId}_${kind}.docx`;
  return { model, date: primaryDate || coverDate, filename };
}

export async function buildReportDocx(options: {
  kind: ReportKind;
  config: ClientReportConfig;
  date?: string;
}) {
  const { model, date, filename } = await buildReportModel(options);
  const buffer = await packReportDocx(model);
  return { buffer, date, filename, model };
}

/** CLI / 预览用 Markdown（结构与 Word 对齐） */
export async function buildReportMarkdown(options: {
  kind: ReportKind;
  config: ClientReportConfig;
  date?: string;
}) {
  const { model, date, filename } = await buildReportModel(options);
  const blocks: string[] = [
    mdHeading(1, model.title),
    model.subtitle,
    model.meta.map((l) => `- ${l}`).join("\n"),
    "---",
    mdHeading(2, model.highlightTitle ?? "今日必看"),
    model.highlights.map((l) => `- ${l}`).join("\n"),
  ];

  for (const section of model.sections) {
    blocks.push(mdHeading(2, section.heading));
    if (section.paragraphs?.length) {
      blocks.push(section.paragraphs.join("\n\n"));
    }
    if (section.bullets?.length) {
      blocks.push(section.bullets.map((b) => `- ${b}`).join("\n"));
    }
    if (section.table?.rows.length) {
      blocks.push(mdTable(section.table.headers, section.table.rows));
    }
    if (section.note) blocks.push(`> ${section.note}`);
  }

  if (model.footerNote) blocks.push(`---\n_${model.footerNote}_`);

  return {
    markdown: joinBlocks(...blocks) + "\n",
    date,
    filename: filename.replace(/\.docx$/i, ".md"),
  };
}

export function buildBlankTemplate(kind: ReportKind) {
  const title =
    kind === "daily" ? "{{客户名}} · 小游戏日报" : "{{客户名}} · 小游戏周报";
  return joinBlocks(
    mdHeading(1, title),
    "- 客户：\n- 数据日：\n- 平台：",
    "---",
    mdHeading(2, "今日必看"),
    "- ",
    mdHeading(2, kind === "daily" ? "关注游戏" : "每周游戏报告"),
    "_（填写）_",
  );
}
