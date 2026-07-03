import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 可点击文字链接悬停：主题色（勿用 cn 合并 text-*，避免 twMerge 误删基础色） */
export const linkHoverClass = "transition-colors hover:text-brand";

/** 正文色文字链接（游戏名、标题等） */
export const textLinkClass =
  "font-medium text-slate-900 transition-colors hover:text-brand";

/** 次要文字链接（返回、辅助导航等） */
export const mutedLinkClass =
  "text-slate-500 transition-colors hover:text-brand";

/** 卡片头部「查看全部」类操作链接 */
export const panelActionLinkClass =
  "inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg px-2 py-1 text-sm font-medium text-brand-text transition-colors hover:bg-brand-soft hover:text-brand";

export function formatDateLabel(date: string) {
  const [year, month, day] = date.split("-");
  return `${month}/${day}`;
}
