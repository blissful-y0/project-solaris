import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";

/** 알림 이력 조회 (최신 100건) */
export async function GET(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin();
    const rawLimit = Number(request.nextUrl.searchParams.get("limit") ?? 100);
    const rawOffset = Number(request.nextUrl.searchParams.get("offset") ?? 0);
    const limit = Number.isFinite(rawLimit) ? Math.min(300, Math.max(1, Math.floor(rawLimit))) : 100;
    const offset = Number.isFinite(rawOffset) ? Math.max(0, Math.floor(rawOffset)) : 0;

    const { data, error } = await supabase
      .from("notifications")
      .select("id, user_id, scope, type, title, body, channel, delivery_status, created_at")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: "FAILED_TO_FETCH" }, { status: 500 });
    }

    const rows = data ?? [];
    const hasMore = rows.length === limit;
    return NextResponse.json({
      data: rows,
      page: {
        limit,
        offset,
        hasMore,
        nextOffset: hasMore ? offset + limit : null,
      },
    });
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
