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
        "bg-bg-secondary/95 backdrop-blur-sm",
        "border-r border-border",
      )}
    >
      {/* 로고 영역 */}
      <div className="relative flex h-14 items-center px-5">
        <div>
          <span className="hud-label text-primary font-semibold text-glow-cyan tracking-wider">
            SOLARIS TERMINAL
          </span>
          <div className="mt-1 h-px bg-gradient-to-r from-primary/60 via-primary/20 to-transparent" />
        </div>
      </div>

      {/* 섹션 구분 — NAVIGATION 라벨 */}
      <div className="px-5 pt-3 pb-1">
        <span className="text-[0.6rem] font-medium uppercase tracking-[0.2em] text-text-secondary/40">
          Navigation
        </span>
      </div>

      {/* 네비게이션 메뉴 */}
      <nav className="flex-1 py-1" role="navigation">
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
                aria-label={`${item.label} (캐릭터 승인 후 이용 가능)`}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-2.5",
                  "text-text-secondary/30 cursor-not-allowed",
                )}
                onClick={(e) => e.preventDefault()}
              >
                <span className="relative">
                  <Icon className="h-4.5 w-4.5" />
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
                "group relative flex items-center gap-3 px-4 py-2.5 transition-all duration-200",
                isActive
                  ? "text-primary"
                  : "text-text-secondary hover:text-text",
              )}
            >
              {/* 활성 인디케이터 — 좌측 글로우 바 */}
              <span
                className={cn(
                  "absolute left-0 top-1/2 -translate-y-1/2 w-[2px] rounded-full transition-all duration-200",
                  isActive
                    ? "h-6 bg-primary shadow-[0_0_8px_rgba(0,212,255,0.6)]"
                    : "h-0 bg-primary/40 group-hover:h-4",
                )}
              />

              {/* 활성 배경 */}
              <span
                className={cn(
                  "absolute inset-x-2 inset-y-0.5 rounded-md transition-colors duration-200 -z-10",
                  isActive
                    ? "bg-primary/10"
                    : "bg-transparent group-hover:bg-bg-tertiary/50",
                )}
              />

              {/* 아이콘 */}
              <span
                className={cn(
                  "transition-all duration-200",
                  isActive && "drop-shadow-[0_0_8px_rgba(0,212,255,0.5)]",
                  !isActive && "group-hover:drop-shadow-[0_0_4px_rgba(0,212,255,0.2)]",
                )}
              >
                <Icon className="h-4.5 w-4.5" />
              </span>

              {/* 라벨 */}
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* 시스템 상태 */}
      <div className="border-t border-border/50 px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          <span className="hud-label text-success">SYS:ONLINE</span>
        </div>
        <p className="mt-1 text-[0.6rem] text-text-secondary/30 tracking-wider">
          HELIOS v3.1.7 — STABLE
        </p>
      </div>
    </aside>
  );
}
