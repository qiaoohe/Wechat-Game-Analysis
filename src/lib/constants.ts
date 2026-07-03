export const RANK_TYPES = ["bestseller", "popular", "most_played"] as const;

export type RankType = (typeof RANK_TYPES)[number];

export const RANK_TYPE_LABELS: Record<RankType, string> = {
  bestseller: "畅销榜",
  popular: "人气榜",
  most_played: "畅玩榜",
};

export const RANK_TYPE_DESCRIPTIONS: Record<RankType, string> = {
  bestseller: "反映付费用户规模、付费意愿与整体收入水平（T+1 更新）",
  popular: "基于用户活跃度等综合指标计算的热门游戏",
  most_played: "基于活跃度与有效广告等指标，适合 IAA 产品参考",
};

/** 微信小游戏官网公开榜单页 rank_id（xiaoyouxi.qq.com/rankdetail/{id}.html） */
export const PUBLIC_RANK_PAGE_IDS: Record<RankType, number> = {
  bestseller: 2,
  popular: 3,
  most_played: 4,
};

export const PUBLIC_RANK_SOURCE = "https://xiaoyouxi.qq.com";

export const DATA_SOURCE_NOTE =
  "微信官方小游戏榜单数据，T+1 更新，仅供内部监测分析。";

export const ALLOWED_ICON_HOSTS = [
  "mmbiz.qpic.cn",
  "mmgame.qpic.cn",
  "mmocgame.qpic.cn",
  "wx.qlogo.cn",
  "thirdwx.qlogo.cn",
  "res.wx.qq.com",
];
