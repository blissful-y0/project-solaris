"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TopBar } from "./TopBar";
import { MobileTabBar } from "./MobileTabBar";
import { DesktopSidebar } from "./DesktopSidebar";

interface DashboardLayoutProps {
  children: ReactNode;
  currentPath?: string;
  notificationCount?: number;
}

export function DashboardLayout({
  children,
  currentPath = "/",
  notificationCount,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-dvh bg-bg">
      <TopBar notificationCount={notificationCount} />
      <DesktopSidebar currentPath={currentPath} />
      <MobileTabBar currentPath={currentPath} />

      <main
        className={cn(
          "pt-14 px-4 pb-16",
          "md:pb-0 md:pl-[244px] md:pr-6",
        )}
      >
        {children}
      </main>
    </div>
  );
}
