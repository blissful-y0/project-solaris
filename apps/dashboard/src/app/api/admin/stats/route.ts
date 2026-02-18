import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";

/** 관리자 대시보드 통계 */
export async function GET() {
  try {
    const { supabase } = await requireAdmin();

    const [characters, users, notifications] = await Promise.all([
      supabase.from("characters").select("status", { count: "exact", head: false }),
      supabase.from("users").select("id", { count: "exact", head: true }),
      supabase.from("notifications").select("id", { count: "exact", head: true }),
    ]);

    const charRows = characters.data ?? [];
    const pending = charRows.filter((r) => r.status === "pending").length;
    const approved = charRows.filter((r) => r.status === "approved").length;
    const rejected = charRows.filter((r) => r.status === "rejected").length;

    return NextResponse.json({
      data: {
        characters: { pending, approved, rejected, total: charRows.length },
        users: users.count ?? 0,
        notifications: notifications.count ?? 0,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }

    console.error("[admin/stats] 예상치 못한 에러:", error);
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
