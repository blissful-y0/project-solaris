import { cn } from "@/lib/utils";
import { Card, ProgressBar } from "@/components/ui";
import type { SystemStatus } from "./mock-core-data";

interface CoreSystemStatusProps {
  data: SystemStatus;
  className?: string;
}

/** HELIOS 시스템 상태 — ARC 진행도 + 공명율 + 활성 작전 수 */
export function CoreSystemStatus({ data, className }: CoreSystemStatusProps) {
  return (
    <Card hud className={cn("space-y-4", className)}>
      <p className="hud-label">HELIOS SYSTEM STATUS</p>

      {/* ARC 진행도 */}
      <div className="space-y-1.5">
        <p className="font-mono text-xs text-text-secondary">
          ARC-01 // {data.arcProgress}%
        </p>
        <ProgressBar
          value={data.arcProgress}
          max={100}
          variant="cyan"
        />
      </div>

      {/* 도시 공명율 */}
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[0.625rem] text-text-secondary uppercase">
          CITY RESONANCE RATE
        </span>
        <span className="text-xl font-bold text-primary">
          {data.cityResonance}%
        </span>
      </div>

      {/* 활성 작전 수 */}
      <div className="flex items-baseline justify-between border-t border-border pt-3">
        <span className="font-mono text-[0.625rem] text-text-secondary uppercase">
          ACTIVE OPERATIONS
        </span>
        <span className="text-xl font-bold text-text">
          {data.activeOperations}
        </span>
      </div>
    </Card>
  );
}
