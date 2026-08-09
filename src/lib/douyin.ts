/** 抖音小游戏栏目（与微信数据隔离的路由 / SEO / 存储命名空间） */

export const PLATFORM_DOUYIN = "douyin" as const;

/** 库内 app_id / rank_type 前缀，避免与微信游戏撞名、撞榜 */
export const DOUYIN_APP_ID_PREFIX = "dy:" as const;
export const DOUYIN_RANK_TYPE_PREFIX = "dy:" as const;

/** 与工作台「游戏排行榜」四列一致 */
export const DOUYIN_RANK_TYPES = [
  "popular",
  "bestseller",
  "new_game",
  "publisher_heat",
] as const;

export type DouyinRankType = (typeof DOUYIN_RANK_TYPES)[number];

export const DOUYIN_RANK_TYPE_LABELS: Record<DouyinRankType, string> = {
  popular: "热门榜",
  bestseller: "畅销榜",
  new_game: "新游榜",
  publisher_heat: "发行人热度榜",
};

/** 文案对齐工作台 titleTips */
export const DOUYIN_RANK_TYPE_DESCRIPTIONS: Record<DouyinRankType, string> = {
  popular: "依据小游戏访问用户量综合计算（每天更新）",
  bestseller: "依据小游戏广告消耗与付费情况综合计算（每天更新）",
  new_game: "依据近期新上线的小游戏访问用户量综合计算（每天更新）",
  publisher_heat: "依据小游戏近 1 周发行人场景的营收能力计算（每天更新）",
};

/** 工作台 GetWorkbenchGameRankList.rankType：HotGame=1 / BestSeller=2 / NewGame=3 / Pop=4 */
export const DOUYIN_CONSOLE_RANK_TYPE_CODES: Record<DouyinRankType, number> = {
  popular: 1,
  bestseller: 2,
  new_game: 3,
  publisher_heat: 4,
};

export const DOUYIN_PAGE_DESCRIPTIONS = {
  rankings:
    "依据访问用户量、广告与付费、新游表现及发行人场景营收等维度综合计算（每天更新）",
  rising: "按日环比、7 日变化与连续上升天数等指标综合计算（每天更新）",
} as const;

export const DOUYIN_BASE_PATH = "/douyin";
export const DOUYIN_RANKINGS_PATH = "/douyin/rankings";
export const DOUYIN_RISING_PATH = "/douyin/rising";
export const DOUYIN_GAMES_PATH = "/douyin/games";

export const DOUYIN_CONSOLE_RANK_API =
  "https://developer.open-douyin.com/bff_api_game_console/v1/PlatBaseSettingServices/GetWorkbenchGameRankList";

export const DOUYIN_CONSOLE_REFERER =
  "https://developer.open-douyin.com/game-console/1183671/game-manage?tab=hot-trending";

export function douyinGamePath(gameId: number | string) {
  return `${DOUYIN_GAMES_PATH}/${gameId}`;
}

export function isDouyinRankType(value?: string): value is DouyinRankType {
  return !!value && DOUYIN_RANK_TYPES.includes(value as DouyinRankType);
}

export function toDouyinStorageRankType(rankType: DouyinRankType) {
  return `${DOUYIN_RANK_TYPE_PREFIX}${rankType}`;
}

export function toDouyinStorageAppId(ttAppId: string) {
  const id = ttAppId.trim();
  if (!id) return "";
  return id.startsWith(DOUYIN_APP_ID_PREFIX) ? id : `${DOUYIN_APP_ID_PREFIX}${id}`;
}

export function isDouyinStorageAppId(appId: string | null | undefined) {
  return Boolean(appId?.startsWith(DOUYIN_APP_ID_PREFIX));
}

export function isDouyinStorageRankType(rankType: string) {
  return rankType.startsWith(DOUYIN_RANK_TYPE_PREFIX);
}
