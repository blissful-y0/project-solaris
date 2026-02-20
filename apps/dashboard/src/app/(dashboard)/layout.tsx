"use client";

import { usePathname } from "next/navigation";
import {
  DashboardLayout,
  DashboardSessionProvider,
  useDashboardSession,
} from "@/components/layout";

/** 대시보드 라우트 그룹 공통 레이아웃 — TopBar + TabBar/Sidebar 포함 */
export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardSessionProvider>
      <DashboardLayoutWithSession>{children}</DashboardLayoutWithSession>
    </DashboardSessionProvider>
  );
}

function DashboardLayoutWithSession({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { me } = useDashboardSession();

  const isCharacterApproved = me?.character?.status === "approved";

  return (
    <DashboardLayout currentPath={pathname} isCharacterApproved={isCharacterApproved}>
      {children}
    </DashboardLayout>
  );
}
