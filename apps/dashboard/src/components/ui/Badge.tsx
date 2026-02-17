import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const variantStyles = {
  default: "bg-subtle/50 text-text-secondary border border-border",
  success: "bg-success/15 text-success border border-success/30",
  warning: "bg-warning/15 text-warning border border-warning/30",
  danger: "bg-accent/15 text-accent border border-accent/30",
  info: "bg-primary/15 text-primary border border-primary/30",
} as const;

const sizeStyles = {
  sm: "px-2 py-0.5 text-[0.625rem]",
  md: "px-2.5 py-1 text-xs",
} as const;

type BadgeProps = {
  variant?: keyof typeof variantStyles;
  size?: keyof typeof sizeStyles;
  children: ReactNode;
  className?: string;
};

export function Badge({
  variant = "default",
  size = "sm",
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium uppercase tracking-wide",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
    >
      {children}
    </span>
  );
}
