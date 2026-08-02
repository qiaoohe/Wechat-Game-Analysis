import { pinyin } from "pinyin-pro";

/** 是否像拼音 / 英文检索（含空格与常见符号） */
export function looksLikePinyinQuery(query: string): boolean {
  const q = query.trim();
  if (!q) return false;
  return /^[a-zA-Z0-9\s.'_-]+$/.test(q);
}

function normalizeLatin(value: string): string {
  return value.toLowerCase().replace(/[\s.'_-]+/g, "");
}

/** 全拼 + 首字母，便于 wzry / wangzhe 检索 */
export function buildPinyinKeys(text: string): { full: string; abbr: string } {
  const cleaned = text.trim();
  if (!cleaned) return { full: "", abbr: "" };

  const full = normalizeLatin(
    pinyin(cleaned, {
      toneType: "none",
      type: "array",
      nonZh: "consecutive",
      v: true,
    }).join(""),
  );

  const abbr = normalizeLatin(
    pinyin(cleaned, {
      pattern: "first",
      toneType: "none",
      type: "array",
      nonZh: "consecutive",
      v: true,
    }).join(""),
  );

  return { full, abbr };
}

export function matchesPinyin(
  text: string | null | undefined,
  query: string,
): boolean {
  if (!text?.trim()) return false;
  const q = normalizeLatin(query);
  if (!q) return false;

  const { full, abbr } = buildPinyinKeys(text);
  return full.includes(q) || abbr.includes(q);
}
