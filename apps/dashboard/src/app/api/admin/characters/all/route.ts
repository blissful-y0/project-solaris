import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";

const VALID_STATUSES = ["approved", "rejected", "pending"] as const;

/** 캐릭터 목록 조회 (status 필터 지원) */
export async function GET(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin();

    const statusParam = request.nextUrl.searchParams.get("status");
    const rawLimit = Number(request.nextUrl.searchParams.get("limit") ?? 100);
    const rawOffset = Number(request.nextUrl.searchParams.get("offset") ?? 0);
    const limit = Number.isFinite(rawLimit) ? Math.min(300, Math.max(1, Math.floor(rawLimit))) : 100;
    const offset = Number.isFinite(rawOffset) ? Math.max(0, Math.floor(rawOffset)) : 0;

    let query = supabase
      .from("characters")
      .select(
        "id, user_id, name, faction, ability_class, status, resonance_rate, leader_application, is_leader, profile_image_url, appearance, backstory, profile_data, hp_max, hp_current, will_max, will_current, crossover_style, created_at, ability_name, ability_description, ability_weakness, abilities(id, tier, name, description, cost_hp, cost_will)",
      )
      .order("name", { ascending: true })
      .range(offset, offset + limit - 1);

    if (statusParam && VALID_STATUSES.includes(statusParam as (typeof VALID_STATUSES)[number])) {
      query = query.eq("status", statusParam);
    }

    const { data, error } = await query;

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

    console.error("[admin/characters/all] 예상치 못한 에러:", error);
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
