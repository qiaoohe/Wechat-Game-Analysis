import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  adminSessionCookieOptions,
  verifyAdminSessionToken,
} from "@/lib/admin/auth";

export async function requireAdminApi() {
  const jar = await cookies();
  const session = verifyAdminSessionToken(
    jar.get(ADMIN_SESSION_COOKIE)?.value,
  );
  if (!session) {
    return {
      session: null as null,
      error: NextResponse.json({ error: "未登录" }, { status: 401 }),
    };
  }
  return { session, error: null };
}

export async function getAdminSessionFromCookies() {
  const jar = await cookies();
  return verifyAdminSessionToken(jar.get(ADMIN_SESSION_COOKIE)?.value);
}

export { ADMIN_SESSION_COOKIE, adminSessionCookieOptions };
