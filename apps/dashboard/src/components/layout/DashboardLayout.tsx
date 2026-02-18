"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TopBar } from "./TopBar";
import { SolarisTicker } from "./SolarisTicker";
import { MobileTabBar } from "./MobileTabBar";
import { DesktopSidebar } from "./DesktopSidebar";

interface DashboardLayoutProps {
  children: ReactNode;
  currentPath?: string;
  notificationCount?: number;
  /** 캐릭터 승인 여부 — MobileTabBar/DesktopSidebar에 전달 */
  isCharacterApproved?: boolean;
}

export function DashboardLayout({
  children,
  currentPath = "/",
  notificationCount,
  isCharacterApproved,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-dvh bg-bg">
      <TopBar notificationCount={notificationCount} />
      <SolarisTicker />
      <DesktopSidebar
        currentPath={currentPath}
        isCharacterApproved={isCharacterApproved}
      />
      <MobileTabBar
        currentPath={currentPath}
        isCharacterApproved={isCharacterApproved}
      />

      <main
        className={cn(
          "pt-22 px-4 pb-16",
          "md:pb-0 md:pl-[244px] md:pr-6",
        )}
      >
        {children}
      </main>
    </div>
  );
}
