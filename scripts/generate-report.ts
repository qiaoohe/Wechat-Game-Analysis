/**
 * 生成客户日报 / 周报 Markdown（可再转 PDF）
 *
 * 用法：
 *   npm run report -- --client=example --kind=daily
 *   npm run report -- --client=example --kind=weekly
 *   npm run report -- --blank=daily
 *   npm run report -- --client=example --kind=daily --date=2026-08-17
 *
 * 客户配置：reports/clients/<clientId>.json
 * 输出目录：reports/out/
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  buildBlankTemplate,
  buildReportMarkdown,
} from "../src/lib/reports/generate";
import type {
  ClientReportConfig,
  ReportKind,
} from "../src/lib/reports/types";

function parseArgs(argv: string[]) {
  const out: Record<string, string | boolean> = {};
  for (const arg of argv) {
    if (!arg.startsWith("--")) continue;
    const [key, ...rest] = arg.slice(2).split("=");
    out[key] = rest.length > 0 ? rest.join("=") : true;
  }
  return out;
}

async function loadClient(clientId: string): Promise<ClientReportConfig> {
  const file = path.join(process.cwd(), "reports", "clients", `${clientId}.json`);
  const raw = await readFile(file, "utf8");
  const config = JSON.parse(raw) as ClientReportConfig;
  if (!config.clientId) config.clientId = clientId;
  if (!config.clientName) {
    throw new Error(`${file} 缺少 clientName`);
  }
  return config;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const outDir = path.join(process.cwd(), "reports", "out");
  await mkdir(outDir, { recursive: true });

  if (args.blank) {
    const kind = (String(args.blank) === "weekly" ? "weekly" : "daily") as ReportKind;
    const markdown = buildBlankTemplate(kind);
    const filename = `_template_${kind}.md`;
    const outPath = path.join(outDir, filename);
    await writeFile(outPath, markdown, "utf8");
    console.log(JSON.stringify({ ok: true, path: outPath, kind: "blank" }, null, 2));
    return;
  }

  const clientId = String(args.client || "");
  if (!clientId) {
    console.error(
      "请指定 --client=<id>（对应 reports/clients/<id>.json），或使用 --blank=daily|weekly",
    );
    process.exit(1);
  }

  const kind = (String(args.kind || "daily") === "weekly" ? "weekly" : "daily") as ReportKind;
  const date = typeof args.date === "string" ? args.date : undefined;
  const config = await loadClient(clientId);

  const { markdown, filename } = await buildReportMarkdown({
    kind,
    config,
    date,
  });

  const outPath = path.join(outDir, filename);
  await writeFile(outPath, markdown, "utf8");
  console.log(
    JSON.stringify(
      {
        ok: true,
        path: outPath,
        kind,
        clientId: config.clientId,
        tip: "管理后台可直接下载 Word；CLI 输出为 Markdown",
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
