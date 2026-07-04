import { RefreshOnFocus } from "@/components/shared/refresh-on-focus";

/** MP 实时数据页：禁用各类服务端/路由缓存 */
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const dynamic = "force-dynamic";

export default function InsightsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <RefreshOnFocus />
      {children}
    </>
  );
}
