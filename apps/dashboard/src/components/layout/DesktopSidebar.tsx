"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-items";

interface DesktopSidebarProps {
  currentPath: string;
  /** 캐릭터 승인 여부 — false이면 requireApproval 항목 잠금 */
  isCharacterApproved?: boolean;
}

export function DesktopSidebar({
  currentPath,
  isCharacterApproved = false,
}: DesktopSidebarProps) {
  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-full w-[220px]",
        "hidden flex-col md:flex",
        "bg-bg-secondary border-r border-border",
      )}
    >
      {/* 로고 영역 */}
      <div className="flex h-14 items-center px-5">
        <div>
          <span className="hud-label text-primary font-semibold">
            SOLARIS TERMINAL
          </span>
          <div className="mt-1 h-px w-12 bg-primary/30" />
        </div>
      </div>

      {/* 네비게이션 메뉴 */}
      <nav className="flex-1 py-2" role="navigation">
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
                  "flex w-full items-center gap-3 px-4 py-3",
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
                <span className="text-sm">{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 px-4 py-3 transition-colors",
                isActive
                  ? "border-l-2 border-primary bg-primary/10 text-primary"
                  : "text-text-secondary hover:bg-bg-tertiary hover:text-text",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* 시스템 상태 표시 */}
      <div className="border-t border-border px-5 py-3">
        <span className="hud-label text-success">SYS:ONLINE</span>
      </div>
    </aside>
  );
}
