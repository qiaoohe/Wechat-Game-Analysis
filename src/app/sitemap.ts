import type { MetadataRoute } from "next";

import { SEO_PAGE_COPY, SITE_URL } from "@/lib/site-seo";
import { getRankings } from "@/lib/services/rank-service";

/** sitemap 需及时反映新 URL / lastmod，避免长期返回陈旧快照 */
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = Object.values(SEO_PAGE_COPY).map(
    (page) => ({
      url: `${SITE_URL}${page.path === "/" ? "" : page.path}`,
      lastModified: new Date(),
      changeFrequency: page.path === "/" ? "daily" : "daily",
      priority: page.path === "/" ? 1 : 0.8,
    }),
  );

  let gamePages: MetadataRoute.Sitemap = [];

  try {
    const { items } = await getRankings("bestseller");
    gamePages = items.map((item) => ({
      url: `${SITE_URL}/games/${item.gameId}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch {
    // 数据库不可用时仍输出静态页面 sitemap
  }

  return [...staticPages, ...gamePages];
}
