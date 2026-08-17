import { getDbMode, usePostgres } from "./config";
import { getPostgresDb, initPostgresDatabase, pgSchema } from "./postgres";
import { getSqliteDb, initSqliteDatabase, sqliteSchema } from "./sqlite";

export type AppDb = ReturnType<typeof getPostgresDb> | ReturnType<typeof getSqliteDb>;

let dbInstance: AppDb | null = null;

function createDb(): AppDb {
  return usePostgres() ? getPostgresDb() : getSqliteDb();
}

export function getDb(): AppDb {
  if (!dbInstance) {
    dbInstance = createDb();
  }
  return dbInstance;
}

/** 双数据库驱动统一入口（Postgres / SQLite） */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db: any = new Proxy({} as AppDb, {
  get(_target, prop) {
    const real = getDb();
    const value = Reflect.get(real, prop, real);
    return typeof value === "function" ? value.bind(real) : value;
  },
});

export async function initDatabase() {
  // CREATE IF NOT EXISTS 可重复执行；避免热更新后跳过导致新表未建
  if (usePostgres()) {
    await initPostgresDatabase();
  } else {
    initSqliteDatabase();
  }
}

export function getDatabaseInfo() {
  return {
    mode: getDbMode(),
    label: usePostgres() ? "Vercel Postgres" : "本地 SQLite（开发模式）",
  };
}

const activeSchema = usePostgres() ? pgSchema : sqliteSchema;
export const games = activeSchema.games;
export const rankSnapshots = activeSchema.rankSnapshots;
export const fetchLogs = activeSchema.fetchLogs;
export const insightSnapshots = activeSchema.insightSnapshots;
export const reportClients = activeSchema.reportClients;

export type {
  Game,
  RankSnapshot,
  FetchLog,
  InsightSnapshot,
  ReportClient,
} from "./schema.pg";
