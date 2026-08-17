import { ProLanding } from "@/components/pro/pro-landing";
import { getBusinessContact } from "@/lib/business";
import { createPageMetadata, SEO_PAGE_COPY } from "@/lib/site-seo";

export const metadata = createPageMetadata(SEO_PAGE_COPY.pro);

export default function ProPage() {
  const contact = getBusinessContact();

  return <ProLanding wechat={contact.wechat} note={contact.note} />;
}
