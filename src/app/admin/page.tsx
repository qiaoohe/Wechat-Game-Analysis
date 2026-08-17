import { redirect } from "next/navigation";

import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { getAdminCredentials } from "@/lib/admin/auth";
import { getAdminSessionFromCookies } from "@/lib/admin/session";
import { createPageMetadata } from "@/lib/site-seo";

export const metadata = createPageMetadata({
  title: "管理后台",
  description: "MomoRank 客户报告管理后台",
  path: "/admin",
  noIndex: true,
});

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    redirect("/admin/login");
  }

  const { usingDefaults } = getAdminCredentials();

  return (
    <AdminDashboard
      usingDefaults={usingDefaults}
      username={session.username}
    />
  );
}
