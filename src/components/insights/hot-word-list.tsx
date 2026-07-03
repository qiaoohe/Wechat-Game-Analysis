import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { HotWordItem } from "@/lib/types";

interface HotWordListProps {
  items: HotWordItem[];
}

export function HotWordList({ items }: HotWordListProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <div
              key={`${item.rank}-${item.name}`}
              className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm"
            >
              <span className="font-medium text-zinc-400">#{item.rank}</span>
              <span className="font-medium text-zinc-900">{item.name}</span>
              {item.isNew ? (
                <Badge variant="default" className="bg-brand text-white">
                  新
                </Badge>
              ) : null}
              {item.isUp ? (
                <Badge variant="warning" className="text-brand">
                  升
                </Badge>
              ) : null}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
