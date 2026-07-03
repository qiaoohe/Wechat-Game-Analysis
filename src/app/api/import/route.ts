import { NextResponse } from "next/server";

import { RANK_TYPES } from "@/lib/constants";
import type { ImportPayload } from "@/lib/types";
import { importRankSnapshot } from "@/lib/services/rank-service";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ImportPayload;

    if (!payload.date || !payload.rankType || !Array.isArray(payload.items)) {
      return NextResponse.json(
        { error: "缺少必要字段：date, rankType, items" },
        { status: 400 },
      );
    }

    if (!RANK_TYPES.includes(payload.rankType)) {
      return NextResponse.json({ error: "无效的 rankType" }, { status: 400 });
    }

    if (payload.items.length === 0) {
      return NextResponse.json({ error: "items 不能为空" }, { status: 400 });
    }

    for (const item of payload.items) {
      if (!item.rank || !item.name) {
        return NextResponse.json(
          { error: "每条记录需包含 rank 和 name" },
          { status: 400 },
        );
      }
    }

    const result = await importRankSnapshot(payload);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "导入失败" },
      { status: 500 },
    );
  }
}
