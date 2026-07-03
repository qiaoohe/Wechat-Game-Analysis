export const RANK_TYPES = ["bestseller", "popular", "most_played"] as const;

export type RankType = (typeof RANK_TYPES)[number];

export const RANK_TYPE_LABELS: Record<RankType, string> = {
  bestseller: "畅销榜",
  popular: "人气榜",
  most_played: "畅玩榜",
};

export const RANK_TYPE_DESCRIPTIONS: Record<RankType, string> = {
  bestseller: "按游戏用户活跃度与有效付费等指标综合计算（每天更新）",
  popular: "按游戏用户活跃度等指标综合计算（每天更新）",
  most_played: "按活跃度与有效广告等指标综合计算（每天更新）",
};

/** 全站页面副标题：指标说明 + （每天更新） */
export const PAGE_DESCRIPTIONS = {
  overview: "按游戏用户活跃度与有效付费等指标综合计算（每天更新）",
  rankings:
    "按游戏用户活跃度、有效付费与广告转化等指标综合计算（每天更新）",
  rising: "按日环比、7 日变化与连续上升天数等指标综合计算（每天更新）",
  hotWords: "按搜索热度等指标综合计算（每天更新）",
  hotSearch: "按用户搜索后的访问情况等指标综合计算（每天更新）",
  ipTrends: "按 IP 搜索、阅读热度等指标综合计算（每天更新）",
} as const;

/** 微信小游戏官网公开榜单页 rank_id（xiaoyouxi.qq.com/rankdetail/{id}.html） */
export const PUBLIC_RANK_PAGE_IDS: Record<RankType, number> = {
  bestseller: 2,
  popular: 3,
  most_played: 4,
};

export const PUBLIC_RANK_SOURCE = "https://xiaoyouxi.qq.com";

/** MP 热点创意工具榜单 API（需登录 Cookie） */
export const MP_HOTSPOT_SOURCE = "mp_hotspot";

/** rank_type：1 人气 / 2 畅销 / 3 畅玩（来自 gamemp getwxagranklistformp） */
export const MP_HOTSPOT_RANK_TYPE_CODES: Record<RankType, number> = {
  popular: 1,
  bestseller: 2,
  most_played: 3,
};

export type FetchSourceMode = "mp_hotspot" | "public_web" | "auto";

export const DATA_SOURCE_NOTE_PUBLIC = PAGE_DESCRIPTIONS.overview;

export const DATA_SOURCE_NOTE_MP = PAGE_DESCRIPTIONS.overview;

/** @deprecated 使用 getDataSourceNote() 动态文案 */
export const DATA_SOURCE_NOTE = DATA_SOURCE_NOTE_PUBLIC;

export const ALLOWED_ICON_HOSTS = [
  "mmbiz.qpic.cn",
  "mmgame.qpic.cn",
  "mmocgame.qpic.cn",
  "wx.qlogo.cn",
  "thirdwx.qlogo.cn",
  "res.wx.qq.com",
];
