import { cn } from "@/lib/utils";
import { Card } from "@/components/ui";
import type { BattleHighlight } from "./mock-core-data";

interface CoreHighlightsProps {
  items: readonly BattleHighlight[];
  className?: string;
}

/** 전투 하이라이트 — 참가자/결과/GM 요약 */
export function CoreHighlights({ items, className }: CoreHighlightsProps) {
  return (
    <Card hud className={cn("space-y-3", className)}>
      <p className="hud-label">COMBAT HIGHLIGHTS</p>

      {items.length === 0 ? (
        <p className="text-sm text-text-secondary">기록된 전투가 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="rounded-md border border-border bg-bg-tertiary/40 p-3"
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-text">
                  {item.participants}
                </p>
                <span className="shrink-0 text-[0.625rem] text-text-secondary/60">
                  {item.date}
                </span>
              </div>
              <p className="text-xs font-medium text-primary">{item.result}</p>
              <p className="mt-1 text-sm text-text-secondary leading-relaxed">
                {item.gmSummary}
              </p>
            </article>
          ))}
        </div>
      )}
    </Card>
  );
}
