import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui";
import type { TimelineEntry } from "./mock-core-data";

const severityConfig = {
  critical: { label: "CRITICAL", variant: "danger" as const, dotColor: "bg-accent" },
  alert: { label: "ALERT", variant: "warning" as const, dotColor: "bg-warning" },
  info: { label: "INFO", variant: "default" as const, dotColor: "bg-primary" },
} as const;

interface CoreTimelineItemProps {
  entry: TimelineEntry;
}

/** 타임라인 개별 항목 */
export function CoreTimelineItem({ entry }: CoreTimelineItemProps) {
  const config = severityConfig[entry.severity];

  return (
    <article className="relative pl-6">
      {/* 타임라인 도트 */}
      <span
        data-testid="timeline-dot"
        className={cn(
          "absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-bg-secondary",
          config.dotColor,
        )}
      />

      {/* 타임스탬프 + severity */}
      <div className="mb-1 flex items-center gap-2">
        <span className="font-mono text-xs text-text-secondary">
          {entry.timestamp}
        </span>
        <Badge variant={config.variant} size="sm">
          {config.label}
        </Badge>
      </div>

      {/* 제목 */}
      <p className="font-semibold text-sm text-text">{entry.title}</p>

      {/* 요약 (2줄 제한) */}
      <p className="mt-0.5 text-sm text-text-secondary leading-relaxed line-clamp-2">
        {entry.summary}
      </p>
    </article>
  );
}
