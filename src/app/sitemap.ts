import type { MetadataRoute } from "next";

import {
  DOUYIN_BASE_PATH,
  DOUYIN_GAMES_PATH,
} from "@/lib/douyin";
import {
  getDouyinRankings,
  hasDouyinRankData,
} from "@/lib/services/douyin-rank-service";
import {
  listPublisherNames,
  publisherPath,
} from "@/lib/services/publisher-service";
import { getRankings } from "@/lib/services/rank-service";
import { SEO_PAGE_COPY, SITE_URL } from "@/lib/site-seo";

/** sitemap 需及时反映新 URL / lastmod，避免长期返回陈旧快照 */
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = Object.values(SEO_PAGE_COPY).map(
    (page) => ({
      url: `${SITE_URL}${page.path === "/" ? "" : page.path}`,
      lastModified: new Date(),
      changeFrequency: page.path === "/" ? "daily" : "daily",
      priority:
        page.path === "/" || page.path === DOUYIN_BASE_PATH
          ? 1
          : page.path.startsWith("/douyin")
            ? 0.85
            : 0.8,
    }),
  );

  let gamePages: MetadataRoute.Sitemap = [];
  let publisherPages: MetadataRoute.Sitemap = [];
  let douyinGamePages: MetadataRoute.Sitemap = [];

  try {
    const { items } = await getRankings("bestseller");
    gamePages = items.map((item) => ({
      url: `${SITE_URL}/games/${item.gameId}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    const publishers = await listPublisherNames();
    publisherPages = publishers
      .map((name) => publisherPath(name))
      .filter((path): path is string => Boolean(path))
      .map((path) => ({
        url: `${SITE_URL}${path}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.5,
      }));

    if (await hasDouyinRankData()) {
      const { items: douyinItems } = await getDouyinRankings("popular");
      douyinGamePages = douyinItems.map((item) => ({
        url: `${SITE_URL}${DOUYIN_GAMES_PATH}/${item.gameId}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
    }
  } catch {
    // 数据库不可用时仍输出静态页面 sitemap
  }

  return [...staticPages, ...gamePages, ...publisherPages, ...douyinGamePages];
}
