/** Markdown 拼装辅助 */

export function mdHeading(level: 1 | 2 | 3, text: string) {
  return `${"#".repeat(level)} ${text}`;
}

export function mdTable(headers: string[], rows: string[][]) {
  const escape = (cell: string) =>
    cell.replace(/\|/g, "\\|").replace(/\n/g, " ");
  const head = `| ${headers.map(escape).join(" | ")} |`;
  const sep = `| ${headers.map(() => "---").join(" | ")} |`;
  const body = rows
    .map((row) => `| ${row.map((c) => escape(c ?? "")).join(" | ")} |`)
    .join("\n");
  return [head, sep, body].filter(Boolean).join("\n");
}

/** 名次变化：正数上升，负数下降 */
export function formatRankChange(change: number | null | undefined) {
  if (change === null || change === undefined) return "—";
  if (change > 0) return `↑${change}`;
  if (change < 0) return `↓${Math.abs(change)}`;
  return "持平";
}

export function joinBlocks(...blocks: Array<string | null | undefined>) {
  return blocks
    .filter((b): b is string => Boolean(b && b.trim()))
    .join("\n\n");
}
