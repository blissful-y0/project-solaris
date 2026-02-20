import { cn } from "@/lib/utils";

import type { ClearanceLevel } from "./types";
import { CLEARANCE_CONFIG } from "./types";

type ClearanceBadgeProps = {
  level: ClearanceLevel;
  className?: string;
};

/** 기밀 등급 뱃지 — LV.1 PUBLIC / LV.2 RESTRICTED / LV.3 CLASSIFIED */
export function ClearanceBadge({ level, className }: ClearanceBadgeProps) {
  const config = CLEARANCE_CONFIG[level];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-[0.625rem] font-mono font-medium uppercase tracking-wider",
        config.textColor,
        config.borderColor,
        className,
      )}
    >
      <span className="opacity-60">LV.{level}</span>
      <span>{config.label}</span>
    </span>
  );
}
