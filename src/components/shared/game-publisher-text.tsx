import { EllipsisText } from "@/components/shared/ellipsis-text";
import { formatPublisher } from "@/lib/services/publisher-service";
import { cn } from "@/lib/utils";

interface GamePublisherTextProps {
  publisher?: string | null;
  className?: string;
}

/** 游戏名下方的开发商一行 */
export function GamePublisherText({
  publisher,
  className,
}: GamePublisherTextProps) {
  const text = formatPublisher(publisher);
  if (!text) return null;

  return (
    <EllipsisText
      className={cn("mt-0.5 text-xs leading-5 text-slate-500", className)}
    >
      {text}
    </EllipsisText>
  );
}
