import { NextResponse } from "next/server";

import { getReportClient } from "@/lib/admin/clients";
import { requireAdminApi } from "@/lib/admin/session";
import { buildReportDocx } from "@/lib/reports/generate";
import type { ClientReportConfig, ReportKind } from "@/lib/reports/types";

export async function POST(request: Request) {
  const { error } = await requireAdminApi();
  if (error) return error;

  let body: {
    clientId?: string;
    config?: ClientReportConfig;
    kind?: ReportKind;
    date?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "无效请求" }, { status: 400 });
  }

  const kind: ReportKind = body.kind === "weekly" ? "weekly" : "daily";

  let config: ClientReportConfig | null = null;
  if (body.config?.clientId && body.config.clientName) {
    config = body.config;
  } else if (body.clientId) {
    config = await getReportClient(body.clientId);
  }

  if (!config) {
    return NextResponse.json(
      { error: "请提供客户配置或已保存的 clientId" },
      { status: 400 },
    );
  }

  try {
    const result = await buildReportDocx({
      kind,
      config,
      date: body.date,
    });
    return NextResponse.json({
      ok: true,
      filename: result.filename,
      date: result.date,
      base64: result.buffer.toString("base64"),
      mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "生成失败" },
      { status: 500 },
    );
  }
}
