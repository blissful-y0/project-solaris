"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, UserCircle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-items";

interface TopBarProps {
  notificationCount?: number;
  isCharacterApproved?: boolean;
}

export function TopBar({ notificationCount, isCharacterApproved = false }: TopBarProps) {
  const hasNotifications = notificationCount != null && notificationCount > 0;
  const currentPath = usePathname();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 h-14 w-full",
        "flex items-center justify-between px-4 md:px-6",
        "glass-panel border-b-0",
      )}
    >
      {/* 1. 글로벌 로고 */}
      <div className="flex items-center h-full">
        <span className="text-sm font-bold uppercase tracking-widest text-primary text-glow-cyan mr-8">
          SOLARIS
        </span>
      </div>

      {/* 2. 데스크탑 네비게이션 탭 (중앙) */}
      <nav className="hidden md:flex flex-1 items-center gap-1 h-full max-w-2xl" role="navigation">
        {NAV_ITEMS.map((item) => {
          const isActive = currentPath === item.href;
          const isLocked = item.requireApproval && !isCharacterApproved;

          if (isLocked) {
            return (
              <button
                key={item.href}
                type="button"
                aria-disabled="true"
                aria-label={`${item.label} (캐릭터 승인 후 이용 가능)`}
                className={cn(
                  "relative flex flex-1 h-full items-center justify-center px-4",
                  "text-text-secondary/30 cursor-not-allowed",
                )}
                onClick={(e) => e.preventDefault()}
              >
                <div className="relative flex items-center gap-2">
                  <span className="font-mono text-[0.6rem] tracking-widest">[X]</span>
                  <span className="text-xs font-mono tracking-wider uppercase">{item.label}</span>
                  <Lock
                    className="h-3 w-3 absolute -top-1 -right-3"
                    data-testid={`lock-icon-${item.href}`}
                  />
                </div>
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group relative flex flex-1 h-full items-center justify-center px-4 transition-all duration-200",
                isActive
                  ? "text-primary bg-primary/[0.03]"
                  : "text-text-secondary hover:text-text hover:bg-bg-tertiary/50",
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "font-mono text-[0.6rem] tracking-widest transition-opacity duration-200",
                    isActive ? "opacity-100 text-glow-cyan" : "opacity-0 group-hover:opacity-50",
                  )}
                >
                  &gt;
                </span>
                <span
                  className={cn(
                    "text-xs font-mono tracking-wider uppercase transition-colors",
                    isActive && "text-glow-cyan font-medium",
                  )}
                >
                  {item.label}
                </span>
              </div>

              {/* 활성화 하단 테두리 글로우 효과 */}
              <span
                className={cn(
                  "absolute bottom-0 left-0 right-0 h-[2px] w-full transition-all duration-300",
                  isActive
                    ? "bg-primary shadow-[0_-2px_8px_rgba(0,212,255,0.6)]"
                    : "bg-transparent group-hover:bg-primary/30",
                )}
              />
            </Link>
          );
        })}
      </nav>

      {/* 3. 우측 컨트롤 (알림/프로필) */}
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
