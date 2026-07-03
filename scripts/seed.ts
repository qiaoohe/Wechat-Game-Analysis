import { subDays, format } from "date-fns";

import { getGameIconFallback } from "@/lib/utils/icon";
import type { RankType } from "@/lib/constants";
import { usePostgres } from "@/lib/db/config";
import { db, initDatabase, games, rankSnapshots } from "@/lib/db";
import { getSqliteDb } from "@/lib/db/sqlite";

const SAMPLE_GAMES = [
  { name: "向僵尸开炮", publisher: "大梦龙途", category: "塔防", appId: "wx_sample_001" },
  { name: "咸鱼之王", publisher: "豪腾嘉科", category: "放置", appId: "wx_sample_002" },
  { name: "寻道大千", publisher: "三七互娱", category: "修仙", appId: "wx_sample_003" },
  { name: "这城有良田", publisher: "益世界", category: "模拟经营", appId: "wx_sample_004" },
  { name: "改装大作战", publisher: "BeeFun", category: "休闲", appId: "wx_sample_005" },
  { name: "跃动小子", publisher: "家乡互动", category: "动作", appId: "wx_sample_006" },
  { name: "口袋奇兵", publisher: "江娱互动", category: "SLG", appId: "wx_sample_007" },
  { name: "羊了个羊", publisher: "简游科技", category: "休闲", appId: "wx_sample_008" },
  { name: "疯狂骑士团", publisher: "豪腾嘉科", category: "RPG", appId: "wx_sample_009" },
  { name: "次神光之觉醒", publisher: "三七互娱", category: "动作", appId: "wx_sample_010" },
  { name: "冒险大作战", publisher: "4399", category: "冒险", appId: "wx_sample_011" },
  { name: "肥鹅健身房", publisher: "腾讯", category: "休闲", appId: "wx_sample_012" },
  { name: "浪漫餐厅", publisher: "柠檬微趣", category: "模拟经营", appId: "wx_sample_013" },
  { name: "四季合合", publisher: "腾讯", category: "休闲", appId: "wx_sample_014" },
  { name: "王者征途", publisher: "腾讯", category: "策略", appId: "wx_sample_015" },
  { name: "百炼英雄", publisher: "三七互娱", category: "RPG", appId: "wx_sample_016" },
  { name: "开罗游戏世界", publisher: "开罗软件", category: "模拟经营", appId: "wx_sample_017" },
  { name: "动物餐厅", publisher: "两英里科技", category: "模拟经营", appId: "wx_sample_018" },
  { name: "弹壳特攻队", publisher: "海彼游戏", category: "射击", appId: "wx_sample_019" },
  { name: "我的小家", publisher: "柠檬微趣", category: "休闲", appId: "wx_sample_020" },
];

function shuffleWithSeed<T>(array: T[], seed: number): T[] {
  const result = [...array];
  let s = seed;
  for (let i = result.length - 1; i > 0; i -= 1) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function generateRankOrder(dayOffset: number, rankType: RankType): number[] {
  const base = SAMPLE_GAMES.map((_, index) => index);
  const typeSeed = rankType === "bestseller" ? 1 : rankType === "popular" ? 2 : 3;
  const shuffled = shuffleWithSeed(base, dayOffset * 17 + typeSeed * 31);

  if (dayOffset >= 3) {
    const rising = shuffled.indexOf(4);
    if (rising > 2) {
      shuffled.splice(rising, 1);
      shuffled.unshift(4);
    }
  }

  if (dayOffset >= 5) {
    const rising = shuffled.indexOf(9);
    if (rising > 5) {
      shuffled.splice(rising, 1);
      shuffled.splice(2, 0, 9);
    }
  }

  return shuffled.slice(0, 15);
}

function seedSqlite(now: string, rankTypes: RankType[]) {
  getSqliteDb().transaction((tx) => {
    const gameIds: number[] = [];
    for (const game of SAMPLE_GAMES) {
      const inserted = tx
        .insert(games)
        .values({
          appId: game.appId,
          name: game.name,
          publisher: game.publisher,
          category: game.category,
          iconUrl: getGameIconFallback(game.name),
          createdAt: now,
        })
        .returning()
        .get();
      gameIds.push(inserted.id);
    }

    for (let dayOffset = 13; dayOffset >= 0; dayOffset -= 1) {
      const date = format(subDays(new Date(), dayOffset), "yyyy-MM-dd");

      for (const rankType of rankTypes) {
        const order = generateRankOrder(13 - dayOffset, rankType);
        order.forEach((gameIndex, rankIndex) => {
          tx.insert(rankSnapshots)
            .values({
              snapshotDate: date,
              rankType,
              gameId: gameIds[gameIndex]!,
              rank: rankIndex + 1,
              createdAt: now,
            })
            .run();
        });
      }
    }
  });
}

async function seedPostgres(now: string, rankTypes: RankType[]) {
  const gameIds: number[] = [];
  for (const game of SAMPLE_GAMES) {
    const [inserted] = await db
      .insert(games)
      .values({
        appId: game.appId,
        name: game.name,
        publisher: game.publisher,
        category: game.category,
        iconUrl: getGameIconFallback(game.name),
        createdAt: now,
      })
      .returning();
    gameIds.push(inserted!.id);
  }

  for (let dayOffset = 13; dayOffset >= 0; dayOffset -= 1) {
    const date = format(subDays(new Date(), dayOffset), "yyyy-MM-dd");

    for (const rankType of rankTypes) {
      const order = generateRankOrder(13 - dayOffset, rankType);
      for (let rankIndex = 0; rankIndex < order.length; rankIndex += 1) {
        const gameIndex = order[rankIndex]!;
        await db.insert(rankSnapshots).values({
          snapshotDate: date,
          rankType,
          gameId: gameIds[gameIndex]!,
          rank: rankIndex + 1,
          createdAt: now,
        });
      }
    }
  }
}

export async function seedDatabase() {
  await initDatabase();

  const existing = usePostgres()
    ? await db.select().from(games).limit(1)
    : db.select().from(games).limit(1).all();

  if (existing.length > 0) {
    console.log("Database already seeded, skipping.");
    return;
  }

  const now = new Date().toISOString();
  const rankTypes: RankType[] = ["bestseller", "popular", "most_played"];

  if (usePostgres()) {
    await seedPostgres(now, rankTypes);
  } else {
    seedSqlite(now, rankTypes);
  }

  console.log("Seed complete: 14 days × 3 rank types × 15 games");
}

if (require.main === module) {
  seedDatabase().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
