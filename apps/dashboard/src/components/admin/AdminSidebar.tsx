"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "대시보드", icon: "◈" },
  { href: "/admin/characters", label: "심사 큐", icon: "◎" },
  { href: "/admin/characters/all", label: "캐릭터 관리", icon: "☰" },
  { href: "/admin/notifications", label: "알림", icon: "◆" },
  { href: "/admin/settings", label: "설정", icon: "⚙" },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-dvh w-[220px] flex-col border-r border-border bg-bg-secondary">
      {/* 헤더 */}
      <div className="flex h-14 items-center border-b border-border px-4">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="hud-label text-primary">ADMIN</span>
          <span className="text-xs text-text-secondary">CONSOLE</span>
        </Link>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : item.href === "/admin/characters"
                ? pathname === "/admin/characters"
                : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-text-secondary hover:bg-bg-tertiary hover:text-text",
              )}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* 하단 — 홈 복귀 링크 */}
      <div className="border-t border-border px-3 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs text-text-secondary hover:text-text transition-colors"
        >
          <span>←</span>
          <span>대시보드로 돌아가기</span>
        </Link>
      </div>
    </aside>
  );
}
