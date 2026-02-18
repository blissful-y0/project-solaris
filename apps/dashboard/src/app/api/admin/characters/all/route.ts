import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";

const VALID_STATUSES = ["approved", "rejected", "pending"] as const;

/** 캐릭터 목록 조회 (status 필터 지원) */
export async function GET(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin();

    const statusParam = request.nextUrl.searchParams.get("status");

    let query = supabase
      .from("characters")
      .select("*, abilities(*)")
      .order("name", { ascending: true });

    if (statusParam && VALID_STATUSES.includes(statusParam as (typeof VALID_STATUSES)[number])) {
      query = query.eq("status", statusParam);
    }

    const { data, error } = await query;

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

    console.error("[admin/characters/all] 예상치 못한 에러:", error);
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
