"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TopBar } from "./TopBar";
import { SolarisTicker } from "./SolarisTicker";
import { MobileTabBar } from "./MobileTabBar";

interface DashboardLayoutProps {
  children: ReactNode;
  currentPath?: string;
  notificationCount?: number;
  /** 캐릭터 승인 여부 — MobileTabBar/TopBar에 전달 */
  isCharacterApproved?: boolean;
}

export function DashboardLayout({
  children,
  currentPath = "/",
  notificationCount,
  isCharacterApproved,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-dvh bg-bg flex flex-col">
      {/* 1. 상단 글로벌 티커 (전체화면 너비 100%) */}
      <SolarisTicker />

      {/* 2. 중앙 정렬된 메인 애플리케이션 프레임 (최대 너비 1280px) */}
      <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col relative">
        <TopBar 
          notificationCount={notificationCount} 
          isCharacterApproved={isCharacterApproved} 
        />
        
        <main className="flex-1 pt-6 px-4 pb-16 md:pb-0 md:px-6 w-full">
          {children}
        </main>

        <MobileTabBar
          currentPath={currentPath}
          isCharacterApproved={isCharacterApproved}
        />
      </div>
    </div>
  );
}
