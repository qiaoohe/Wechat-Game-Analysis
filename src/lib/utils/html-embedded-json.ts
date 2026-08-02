/** 从 HTML 中提取 `window.<globalKey> = {...}` 嵌入的 JSON 对象 */

export function extractEmbeddedJson<T>(html: string, globalKey: string): T | null {
  const marker = `window.${globalKey}=`;
  const start = html.indexOf(marker);
  if (start === -1) return null;

  let i = start + marker.length;
  while (i < html.length && /\s/.test(html[i]!)) i += 1;
  if (html[i] !== "{") return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let j = i; j < html.length; j += 1) {
    const ch = html[j]!;

    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }

    if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth === 0) {
        try {
          return JSON.parse(html.slice(i, j + 1)) as T;
        } catch {
          return null;
        }
      }
    }
  }

  return null;
}
