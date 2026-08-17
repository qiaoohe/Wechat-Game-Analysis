import { Suspense } from "react";

import { AdminLoginForm } from "@/components/admin/login-form";
import { createPageMetadata } from "@/lib/site-seo";

export const metadata = createPageMetadata({
  title: "管理后台登录",
  description: "MomoRank 管理后台登录",
  path: "/admin/login",
  noIndex: true,
});

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  );
}
