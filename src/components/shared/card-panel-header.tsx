interface CardPanelHeaderProps {
  title: string;
  action?: React.ReactNode;
}

/** 卡片区块标题行（首页畅销榜 / 增速榜等） */
export function CardPanelHeader({ title, action }: CardPanelHeaderProps) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 border-b border-slate-100 px-4 py-3.5 sm:px-6 sm:py-4">
      <h2 className="min-w-0 flex-1 truncate text-base font-semibold text-slate-900 sm:text-lg">
        {title}
      </h2>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
