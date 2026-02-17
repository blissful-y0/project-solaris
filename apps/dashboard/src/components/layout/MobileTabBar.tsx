"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-items";

interface MobileTabBarProps {
  currentPath: string;
}

export function MobileTabBar({ currentPath }: MobileTabBarProps) {
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
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
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
