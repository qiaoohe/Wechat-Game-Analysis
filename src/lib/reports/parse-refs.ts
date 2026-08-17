import type { GameRef } from "@/lib/reports/types";

/** 解析表单里的「12, 向僵尸开炮」为 id / 名称混合列表（纯函数，可在客户端使用） */
export function parseGameRefs(raw: string): GameRef[] {
  return raw
    .split(/[,，\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => (/^\d+$/.test(s) ? Number(s) : s));
}
