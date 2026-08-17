/** 客户报告配置 */

export type ReportPlatform = "wechat" | "douyin" | "both";

export type ReportKind = "daily" | "weekly";

export type GameRef = number | string;

export interface ClientReportConfig {
  /** 文件名用，建议英文/拼音，如 acme */
  clientId: string;
  /** 报告封面展示名 */
  clientName: string;
  /** wechat | douyin | both */
  platform?: ReportPlatform;
  /**
   * 微信主榜：bestseller | popular | most_played
   * 抖音主榜：popular | bestseller | new_game | publisher_heat
   */
  rankType?: string;
  /** 关注游戏：支持库内 ID 或游戏名 */
  watchGames?: GameRef[];
  /** 竞品游戏：支持库内 ID 或游戏名 */
  competitors?: GameRef[];
  /** 报告开头可选说明 */
  notes?: string;
}
