import { NextResponse } from "next/server";

import {
  deleteReportClient,
  listReportClients,
  upsertReportClient,
} from "@/lib/admin/clients";
import { requireAdminApi } from "@/lib/admin/session";
import type { ClientReportConfig } from "@/lib/reports/types";

export async function GET() {
  const { error } = await requireAdminApi();
  if (error) return error;

  const clients = await listReportClients();
  return NextResponse.json({ clients });
}

export async function POST(request: Request) {
  const { error } = await requireAdminApi();
  if (error) return error;

  let body: ClientReportConfig;
  try {
    body = (await request.json()) as ClientReportConfig;
  } catch {
    return NextResponse.json({ error: "无效请求" }, { status: 400 });
  }

  try {
    const saved = await upsertReportClient(body);
    return NextResponse.json({ ok: true, client: saved });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "保存失败" },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const clientId = new URL(request.url).searchParams.get("clientId")?.trim();
  if (!clientId) {
    return NextResponse.json({ error: "缺少 clientId" }, { status: 400 });
  }

  await deleteReportClient(clientId);
  return NextResponse.json({ ok: true });
}
