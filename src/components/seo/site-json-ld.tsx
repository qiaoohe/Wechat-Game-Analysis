import { buildSiteJsonLd } from "@/lib/site-seo";

/** 站点级 JSON-LD，增强品牌名与域名关联 */
export function SiteJsonLd() {
  const jsonLd = buildSiteJsonLd();

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
