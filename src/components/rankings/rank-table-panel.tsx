import { Card } from "@/components/ui/card";
import { CardPanelHeader } from "@/components/shared/card-panel-header";
import { RankMobileList } from "@/components/rankings/rank-mobile-list";
import { RankTable, RankTableDesktop } from "@/components/rankings/rank-table";
import type { RankEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

interface RankTablePanelProps {
  title: string;
  action?: React.ReactNode;
  items: RankEntry[];
  className?: string;
  /** 首页移动端使用卡片列表，桌面端保持表格 */
  mobileCards?: boolean;
  gameHrefPrefix?: string;
}

/** 标题 + 榜单表格合一卡片（首页等场景） */
export function RankTablePanel({
  title,
  action,
  items,
  className,
  mobileCards = false,
  gameHrefPrefix = "/games",
}: RankTablePanelProps) {
  return (
    <Card
      className={cn(
        "flex h-full flex-col border-slate-200/80 bg-white",
        className,
      )}
    >
      <CardPanelHeader title={title} action={action} />

      {mobileCards ? (
        <>
          <div className="min-h-0 flex-1 overflow-hidden md:hidden">
            <RankMobileList items={items} gameHrefPrefix={gameHrefPrefix} />
          </div>
          <div className="hidden min-h-0 flex-1 overflow-hidden md:block">
            <RankTableDesktop items={items} gameHrefPrefix={gameHrefPrefix} />
          </div>
        </>
      ) : (
        <div className="min-h-0 flex-1">
          <RankTable embedded items={items} gameHrefPrefix={gameHrefPrefix} />
        </div>
      )}
    </Card>
  );
}
