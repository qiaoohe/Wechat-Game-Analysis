import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "mr_admin_session";
const SESSION_DAYS = 14;

/** 默认可直接登录；生产请用环境变量覆盖 */
export function getAdminCredentials() {
  return {
    username: process.env.ADMIN_USERNAME?.trim() || "admin",
    password: process.env.ADMIN_PASSWORD?.trim() || "momorank2026",
    secret:
      process.env.ADMIN_SESSION_SECRET?.trim() ||
      "momorank-dev-session-secret-change-me",
    usingDefaults:
      !process.env.ADMIN_USERNAME?.trim() ||
      !process.env.ADMIN_PASSWORD?.trim() ||
      !process.env.ADMIN_SESSION_SECRET?.trim(),
  };
}

export function verifyAdminPassword(username: string, password: string) {
  const creds = getAdminCredentials();
  return username === creds.username && password === creds.password;
}

function b64url(input: string) {
  return Buffer.from(input, "utf8").toString("base64url");
}

function fromB64url(input: string) {
  return Buffer.from(input, "base64url").toString("utf8");
}

function sign(payloadB64: string, secret: string) {
  return createHmac("sha256", secret).update(payloadB64).digest("base64url");
}

export function createAdminSessionToken(username: string) {
  const { secret } = getAdminCredentials();
  const exp = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const payloadB64 = b64url(JSON.stringify({ u: username, exp }));
  const sig = sign(payloadB64, secret);
  return `${payloadB64}.${sig}`;
}

export function verifyAdminSessionToken(token: string | undefined | null) {
  if (!token) return null;
  const [payloadB64, sig] = token.split(".");
  if (!payloadB64 || !sig) return null;

  const { secret } = getAdminCredentials();
  const expected = sign(payloadB64, secret);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(fromB64url(payloadB64)) as {
      u?: string;
      exp?: number;
    };
    if (!payload.u || !payload.exp || Date.now() > payload.exp) return null;
    return { username: payload.u };
  } catch {
    return null;
  }
}

export function adminSessionCookieOptions(maxAgeSeconds = SESSION_DAYS * 86400) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}
