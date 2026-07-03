/** Shared typography classes — keep labels/badges on one line, truncate long content */
export const uiText = {
  th: "px-4 py-3.5 font-medium whitespace-nowrap sm:px-5",
  label: "whitespace-nowrap",
  line1: "block min-w-0 overflow-hidden text-ellipsis truncate whitespace-nowrap",
  line2: "line-clamp-2 min-w-0 overflow-hidden text-ellipsis break-all",
  meta: "block min-w-0 overflow-hidden text-ellipsis truncate text-xs text-slate-400",
  num: "whitespace-nowrap tabular-nums",
  badge: "whitespace-nowrap shrink-0",
} as const;

export const uiCol = {
  gameName: "min-w-0 max-w-full",
  description: "min-w-0 max-w-full",
} as const;
