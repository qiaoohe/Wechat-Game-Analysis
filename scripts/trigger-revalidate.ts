/** 本地抓取写库后，通知线上 Next.js 失效 ISR / CDN 页面缓存 */
export async function triggerRemoteRevalidate(): Promise<{
  ok: boolean;
  skipped?: boolean;
  status?: number;
  body?: unknown;
  message?: string;
}> {
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim() ||
    "https://www.momorank.com"
  ).replace(/\/$/, "");
  const secret = process.env.CRON_SECRET?.trim();

  if (!secret) {
    return {
      ok: false,
      skipped: true,
      message: "未配置 CRON_SECRET，跳过远程缓存失效",
    };
  }

  try {
    const response = await fetch(`${siteUrl}/api/revalidate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
      },
    });
    const body = await response.json().catch(() => null);
    return {
      ok: response.ok,
      status: response.status,
      body,
      message: response.ok
        ? `已失效线上缓存 ${siteUrl}`
        : `线上缓存失效失败 HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? `线上缓存失效请求失败：${error.message}`
          : "线上缓存失效请求失败",
    };
  }
}
