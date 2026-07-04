import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

export const games = sqliteTable("games", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  appId: text("app_id").unique(),
  name: text("name").notNull(),
  publisher: text("publisher"),
  category: text("category"),
  iconUrl: text("icon_url"),
  createdAt: text("created_at").notNull(),
});

export const rankSnapshots = sqliteTable(
  "rank_snapshots",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    snapshotDate: text("snapshot_date").notNull(),
    rankType: text("rank_type").notNull(),
    gameId: integer("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    rank: integer("rank").notNull(),
    rankLabels: text("rank_labels"),
    createdAt: text("created_at").notNull(),
  },
  (table) => [unique().on(table.snapshotDate, table.rankType, table.gameId)],
);

export const fetchLogs = sqliteTable("fetch_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  status: text("status").notNull(),
  message: text("message"),
  itemCount: integer("item_count"),
  createdAt: text("created_at").notNull(),
});

export const insightSnapshots = sqliteTable(
  "insight_snapshots",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    insightType: text("insight_type").notNull(),
    dataDate: text("data_date").notNull(),
    payload: text("payload").notNull(),
    fetchedAt: text("fetched_at").notNull(),
  },
  (table) => [unique().on(table.insightType, table.dataDate)],
);

export type Game = typeof games.$inferSelect;
export type RankSnapshot = typeof rankSnapshots.$inferSelect;
export type FetchLog = typeof fetchLogs.$inferSelect;
export type InsightSnapshot = typeof insightSnapshots.$inferSelect;
