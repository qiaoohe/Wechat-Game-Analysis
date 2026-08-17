import { desc, eq } from "drizzle-orm";

import { db, initDatabase, reportClients } from "@/lib/db";
import type { ClientReportConfig } from "@/lib/reports/types";

function parseConfig(raw: string, clientId: string): ClientReportConfig {
  const parsed = JSON.parse(raw) as ClientReportConfig;
  return {
    ...parsed,
    clientId: parsed.clientId || clientId,
  };
}

export async function listReportClients(): Promise<ClientReportConfig[]> {
  await initDatabase();
  const rows = await db
    .select()
    .from(reportClients)
    .orderBy(desc(reportClients.updatedAt));

  return rows.map((row: { clientId: string; configJson: string }) =>
    parseConfig(row.configJson, row.clientId),
  );
}

export async function getReportClient(
  clientId: string,
): Promise<ClientReportConfig | null> {
  await initDatabase();
  const [row] = await db
    .select()
    .from(reportClients)
    .where(eq(reportClients.clientId, clientId))
    .limit(1);
  if (!row) return null;
  return parseConfig(row.configJson, row.clientId);
}

export async function upsertReportClient(config: ClientReportConfig) {
  if (!config.clientId?.trim() || !config.clientName?.trim()) {
    throw new Error("clientId 与 clientName 必填");
  }

  const normalized: ClientReportConfig = {
    clientId: config.clientId.trim(),
    clientName: config.clientName.trim(),
    platform: config.platform ?? "wechat",
    rankType: config.rankType ?? "bestseller",
    watchGames: config.watchGames ?? [],
    competitors: config.competitors ?? [],
    notes: config.notes ?? "",
  };

  await initDatabase();
  const now = new Date().toISOString();
  const configJson = JSON.stringify(normalized);

  await db
    .insert(reportClients)
    .values({
      clientId: normalized.clientId,
      clientName: normalized.clientName,
      configJson,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: reportClients.clientId,
      set: {
        clientName: normalized.clientName,
        configJson,
        updatedAt: now,
      },
    });

  return normalized;
}

export async function deleteReportClient(clientId: string) {
  await initDatabase();
  await db.delete(reportClients).where(eq(reportClients.clientId, clientId));
}
