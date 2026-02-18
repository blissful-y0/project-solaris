import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/admin-guard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

/** Admin 레이아웃 — 서버사이드 권한 체크 후 렌더 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  try {
    await requireAdmin();
  } catch {
    redirect("/");
  }

  return (
    <div className="min-h-dvh bg-bg">
      <AdminSidebar />
      <main className="pl-[240px] pr-8 py-6">{children}</main>
    </div>
  );
}
