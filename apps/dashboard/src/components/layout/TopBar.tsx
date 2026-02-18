"use client";

import Link from "next/link";
import { Bell, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopBarProps {
  notificationCount?: number;
}

export function TopBar({ notificationCount }: TopBarProps) {
  const hasNotifications = notificationCount != null && notificationCount > 0;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-40 h-14",
        "flex items-center justify-between px-4",
        "bg-bg/90 backdrop-blur-md",
        "border-b border-border",
        "md:pl-[244px] md:pr-6",
      )}
    >
      <span className="text-sm font-bold uppercase tracking-widest text-primary text-glow-cyan">
        SOLARIS
      </span>

      <div className="flex items-center gap-1">
        <button
          type="button"
          className="relative p-2 text-text-secondary transition-colors hover:text-primary"
          aria-label="알림"
        >
          <Bell className="h-5 w-5" />
          {hasNotifications && (
            <span
              data-testid="notification-badge"
              className={cn(
                "absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center",
                "rounded-full bg-accent px-1 text-[0.625rem] font-bold text-white",
              )}
            >
              {notificationCount}
            </span>
          )}
        </button>

        <Link
          href="/my"
          className="p-2 text-text-secondary transition-colors hover:text-primary"
          aria-label="마이페이지"
        >
          <UserCircle className="h-5 w-5" />
        </Link>
      </div>
    </header>
  );
}
