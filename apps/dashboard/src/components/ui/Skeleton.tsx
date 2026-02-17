import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const variantStyles = {
  line: "h-4 w-full rounded",
  circle: "rounded-full",
  card: "h-32 w-full rounded-lg",
} as const;

type SkeletonProps = {
  variant?: keyof typeof variantStyles;
  width?: string;
  height?: string;
} & HTMLAttributes<HTMLDivElement>;

export function Skeleton({
  variant = "line",
  width,
  height,
  className,
  style,
  ...rest
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "bg-subtle/40 animate-[skeleton-pulse_2s_ease-in-out_infinite]",
        variantStyles[variant],
        className,
      )}
      style={{ width, height, ...style }}
      {...rest}
    />
  );
}
