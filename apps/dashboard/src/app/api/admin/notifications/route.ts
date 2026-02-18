import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";

/** 알림 이력 조회 (최신 100건) */
export async function GET() {
  try {
    const { supabase } = await requireAdmin();

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      return NextResponse.json({ error: "FAILED_TO_FETCH" }, { status: 500 });
    }

    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }

    console.error("[admin/notifications] 예상치 못한 에러:", error);
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
