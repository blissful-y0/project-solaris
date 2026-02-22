"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, UserCircle, Lock, LogOut, User } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useDashboardSession } from "./DashboardSessionProvider";
import { NAV_ITEMS } from "./nav-items";

interface TopBarProps {
  notificationCount?: number;
  isCharacterApproved?: boolean;
}

export function TopBar({ notificationCount, isCharacterApproved = false }: TopBarProps) {
  const hasNotifications = notificationCount != null && notificationCount > 0;
  const currentPath = usePathname();
  const router = useRouter();
  const { me } = useDashboardSession();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = useCallback(() => {
    setDropdownOpen((prev) => !prev);
  }, []);

  // click outside 닫기
  useEffect(() => {
    if (!dropdownOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [dropdownOpen]);

  const handleSignOut = useCallback(async () => {
    setDropdownOpen(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }, [router]);

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
        {/* 알림 */}
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

        {/* 유저 드롭다운 */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            className="p-2 text-text-secondary transition-colors hover:text-primary"
            aria-label="유저 메뉴"
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
            onClick={toggleDropdown}
          >
            <UserCircle className="h-5 w-5" />
          </button>

          {dropdownOpen && (
            <div
              className={cn(
                "absolute right-0 top-full mt-1 w-56",
                "rounded-md border border-border bg-bg-secondary shadow-lg",
                "py-1 z-50",
              )}
              role="menu"
            >
              {/* Discord 아이디 */}
              {me?.user.discordUsername && (
                <div className="px-3 py-2 text-xs text-text-secondary font-mono truncate">
                  @{me.user.discordUsername}
                </div>
              )}

              <div className="h-px bg-border mx-2" role="separator" />

              {/* 마이페이지 */}
              <Link
                href="/my"
                className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text hover:bg-bg-tertiary/50 transition-colors"
                role="menuitem"
                onClick={() => setDropdownOpen(false)}
              >
                <User className="h-4 w-4" />
                마이페이지
              </Link>

              {/* 로그아웃 */}
              <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-accent hover:bg-bg-tertiary/50 transition-colors"
                role="menuitem"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                로그아웃
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
