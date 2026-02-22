import { cn } from "@/lib/utils";
import { Card } from "@/components/ui";
import type { TimelineEntry } from "./mock-core-data";
import { CoreTimelineItem } from "./CoreTimelineItem";

interface CoreTimelineProps {
  items: readonly TimelineEntry[];
  className?: string;
}

/** 스토리 브리핑 타임라인 (좌측 세로선 + 도트) */
export function CoreTimeline({ items, className }: CoreTimelineProps) {
  return (
    <Card hud className={cn("space-y-4", className)}>
      {items.length === 0 ? (
        <p className="text-sm text-text-secondary">
          등록된 브리핑이 없습니다.
        </p>
      ) : (
        <div
          data-testid="timeline-line"
          className="relative border-l border-border ml-1 space-y-4 py-1"
        >
          {items.map((entry) => (
            <CoreTimelineItem key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </Card>
  );
}
