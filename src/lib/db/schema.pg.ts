import {
  integer,
  pgTable,
  serial,
  text,
  unique,
} from "drizzle-orm/pg-core";

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  appId: text("app_id").unique(),
  name: text("name").notNull(),
  publisher: text("publisher"),
  category: text("category"),
  iconUrl: text("icon_url"),
  createdAt: text("created_at").notNull(),
});

export const rankSnapshots = pgTable(
  "rank_snapshots",
  {
    id: serial("id").primaryKey(),
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

export const fetchLogs = pgTable("fetch_logs", {
  id: serial("id").primaryKey(),
  status: text("status").notNull(),
  message: text("message"),
  itemCount: integer("item_count"),
  createdAt: text("created_at").notNull(),
});

export type Game = typeof games.$inferSelect;
export type RankSnapshot = typeof rankSnapshots.$inferSelect;
export type FetchLog = typeof fetchLogs.$inferSelect;
