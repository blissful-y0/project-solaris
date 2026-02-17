import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type CardProps = {
  variant?: "default" | "interactive";
  hud?: boolean;
  children: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

export function Card({
  variant = "default",
  hud = false,
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(
        "bg-bg-secondary/80 border border-border rounded-lg p-4 backdrop-blur-sm",
        variant === "interactive" &&
          "hover:border-primary/30 hover:glow-cyan cursor-pointer transition-all",
        hud && "hud-corners",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
