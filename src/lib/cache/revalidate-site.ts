import { revalidatePath } from "next/cache";

/** 数据更新后需要立刻失效的主要页面 */
export const SITE_REVALIDATE_PATHS = [
  "/",
  "/rankings",
  "/rankings/bestseller",
  "/rankings/popular",
  "/rankings/most_played",
  "/rising",
  "/insights/hot-words",
  "/insights/hot-search",
  "/insights/ip-trends",
] as const;

/** 按需失效全站主页面缓存（含根 layout 下的 ISR） */
export function revalidateSitePages(): string[] {
  // 根 layout 失效，覆盖首页 / 榜单 / 增速 / 游戏详情等
  revalidatePath("/", "layout");

  for (const path of SITE_REVALIDATE_PATHS) {
    revalidatePath(path);
  }

  return [...SITE_REVALIDATE_PATHS];
}
