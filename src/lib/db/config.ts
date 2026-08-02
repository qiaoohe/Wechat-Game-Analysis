/**
 * Postgres（Neon）优先；本地可设 DB_MODE=sqlite 强制走 SQLite，
 * 便于 Neon 配额耗尽或离线开发时不改 POSTGRES_URL。
 */
export function usePostgres() {
  const mode = process.env.DB_MODE?.trim().toLowerCase();
  if (mode === "sqlite") return false;
  if (mode === "postgres") {
    if (!process.env.POSTGRES_URL?.trim()) {
      throw new Error("DB_MODE=postgres 但未配置 POSTGRES_URL");
    }
    return true;
  }
  return Boolean(process.env.POSTGRES_URL?.trim());
}

export function getDbMode(): "postgres" | "sqlite" {
  return usePostgres() ? "postgres" : "sqlite";
}
