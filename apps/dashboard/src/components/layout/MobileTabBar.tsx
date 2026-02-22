"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-items";

interface MobileTabBarProps {
  currentPath: string;
  /** 캐릭터 승인 여부 — false이면 requireApproval 항목 잠금 */
  isCharacterApproved?: boolean;
}

export function MobileTabBar({
  currentPath,
  isCharacterApproved = false,
}: MobileTabBarProps) {
  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 h-16 md:hidden",
        "flex items-center justify-around",
        "bg-bg/95 backdrop-blur-md",
        "border-t border-border",
        "pb-[env(safe-area-inset-bottom)]",
      )}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = currentPath === item.href;
        const isLocked = item.requireApproval && !isCharacterApproved;
        const Icon = item.icon;

        if (isLocked) {
          return (
            <button
              key={item.href}
              type="button"
              aria-disabled="true"
              aria-label={item.label}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 py-2",
                "text-text-secondary/40 cursor-not-allowed",
              )}
              onClick={(e) => e.preventDefault()}
            >
              <span className="relative">
                <Icon className="h-5 w-5" />
                <Lock
                  className="absolute -right-1 -top-1 h-3 w-3"
                  data-testid={`lock-icon-${item.href}`}
                />
              </span>
              <span className="text-[0.625rem]">{item.label}</span>
            </button>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-colors",
              isActive
                ? "text-primary"
                : "text-text-secondary hover:text-text",
            )}
          >
            <Icon className={cn("h-5 w-5", isActive && "drop-shadow-[0_0_6px_rgba(0,212,255,0.5)]")} />
            <span className="text-[0.625rem]">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
