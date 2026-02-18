import { cn } from "@/lib/utils";

const gradientStyles = {
  hp: "bg-gradient-to-r from-success to-accent",
  will: "bg-gradient-to-r from-primary to-violet-500",
} as const;

type StatBarProps = {
  current: number;
  max: number;
  variant: "hp" | "will";
  label?: string;
  className?: string;
};

/** HP/WILL 게이지 바 — 퍼센트 채움 + 그라데이션 */
export function StatBar({
  current,
  max,
  variant,
  label,
  className,
}: StatBarProps) {
  const pct = max > 0 ? Math.min(Math.max((current / max) * 100, 0), 100) : 0;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {label && (
        <span className="hud-label w-8 flex-shrink-0">{label}</span>
      )}

      {/* 게이지 트랙 */}
      <div
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label ? `${label} ${current}/${max}` : `${current}/${max}`}
        className="flex-1 h-2 rounded-full bg-bg-tertiary overflow-hidden"
      >
        {/* 채움 바 */}
        <div
          className={cn("h-full rounded-full transition-all", gradientStyles[variant])}
          style={{ width: `${pct}%` }}
        />
      </div>

      <span className="text-[0.65rem] text-text-secondary tabular-nums flex-shrink-0">
        {current}/{max}
      </span>
    </div>
  );
}
