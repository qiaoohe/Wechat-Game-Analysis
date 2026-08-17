import { searchGames, getGameById } from "@/lib/services/rank-service";
import { getDouyinGameById } from "@/lib/services/douyin-rank-service";
import type { GameRef, ReportPlatform } from "@/lib/reports/types";

export type { GameRef };

export interface ResolvedGame {
  id: number;
  name: string;
  publisher: string | null;
}

export { parseGameRefs } from "@/lib/reports/parse-refs";

function searchPlatform(platform: ReportPlatform): "wechat" | "douyin" {
  return platform === "douyin" ? "douyin" : "wechat";
}

/**
 * 将 ID 或游戏名解析为库内游戏。
 * 名称优先精确匹配，其次模糊搜索第一条。
 */
export async function resolveGameRef(
  ref: GameRef,
  platform: ReportPlatform = "wechat",
): Promise<ResolvedGame | null> {
  if (typeof ref === "number" || /^\d+$/.test(String(ref))) {
    const id = typeof ref === "number" ? ref : Number(ref);
    if (platform === "douyin") {
      const game = await getDouyinGameById(id);
      if (!game) return null;
      return {
        id: game.id,
        name: game.name,
        publisher: game.publisher ?? null,
      };
    }
    const game = await getGameById(id);
    if (!game) return null;
    return {
      id: game.id,
      name: game.name,
      publisher: game.publisher ?? null,
    };
  }

  const name = String(ref).trim();
  if (!name) return null;

  const hits = await searchGames(name, 8, searchPlatform(platform));
  if (hits.length === 0) return null;

  const exact = hits.find(
    (h) => h.name === name || h.name.toLowerCase() === name.toLowerCase(),
  );
  const hit = exact ?? hits[0];
  return {
    id: hit.id,
    name: hit.name,
    publisher: hit.publisher ?? null,
  };
}

export async function resolveGameRefs(
  refs: GameRef[] | undefined,
  platform: ReportPlatform = "wechat",
): Promise<{ resolved: ResolvedGame[]; unresolved: string[] }> {
  const resolved: ResolvedGame[] = [];
  const unresolved: string[] = [];
  const seen = new Set<number>();

  for (const ref of refs ?? []) {
    const game = await resolveGameRef(ref, platform);
    if (!game) {
      unresolved.push(String(ref));
      continue;
    }
    if (seen.has(game.id)) continue;
    seen.add(game.id);
    resolved.push(game);
  }

  return { resolved, unresolved };
}
