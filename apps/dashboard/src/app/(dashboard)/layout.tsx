"use client";

import { usePathname } from "next/navigation";
import { ApiActivityProvider, DashboardLayout, DashboardSessionProvider } from "@/components/layout";

/** 대시보드 라우트 그룹 공통 레이아웃 — TopBar + TabBar/Sidebar 포함 */
export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <DashboardSessionProvider>
      <ApiActivityProvider>
        <DashboardLayout currentPath={pathname}>
          {children}
        </DashboardLayout>
      </ApiActivityProvider>
    </DashboardSessionProvider>
  );
}
