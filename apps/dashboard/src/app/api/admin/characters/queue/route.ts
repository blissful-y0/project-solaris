import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin();
    const searchParams = request.nextUrl.searchParams;
    const rawLimit = Number(searchParams?.get("limit") ?? 100);
    const rawOffset = Number(searchParams?.get("offset") ?? 0);
    const limit = Number.isFinite(rawLimit) ? Math.min(300, Math.max(1, Math.floor(rawLimit))) : 100;
    const offset = Number.isFinite(rawOffset) ? Math.max(0, Math.floor(rawOffset)) : 0;

    const { data, error } = await supabase
      .from("characters")
      .select(
        "id, user_id, name, faction, ability_class, status, resonance_rate, leader_application, is_leader, profile_image_url, appearance, backstory, profile_data, hp_max, hp_current, will_max, will_current, crossover_style, created_at, ability_name, ability_description, ability_weakness, abilities(id, tier, name, description, cost_hp, cost_will)",
      )
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: "FAILED_TO_FETCH_QUEUE" }, { status: 500 });
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

    console.error("[admin/queue] 예상치 못한 에러:", error);
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
