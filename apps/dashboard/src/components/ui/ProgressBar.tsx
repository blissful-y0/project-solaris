import { cn } from "@/lib/utils";

const variantStyles = {
  default: "bg-text-secondary",
  cyan: "bg-primary",
  red: "bg-accent",
} as const;

interface ProgressBarProps {
  value: number;
  max: number;
  variant?: keyof typeof variantStyles;
  label?: string;
  className?: string;
}

/** 심플 프로그레스바 컴포넌트 */
export function ProgressBar({
  value,
  max,
  variant = "default",
  label,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {label && (
        <span data-testid="progress-label" className="text-xs text-text-secondary">
          {label}
        </span>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className="h-2 w-full rounded-full bg-subtle/50"
      >
        <div
          className={cn("h-full rounded-full", variantStyles[variant])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
