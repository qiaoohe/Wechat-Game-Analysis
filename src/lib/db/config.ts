export function usePostgres() {
  return Boolean(process.env.POSTGRES_URL?.trim());
}

export function getDbMode(): "postgres" | "sqlite" {
  return usePostgres() ? "postgres" : "sqlite";
}
