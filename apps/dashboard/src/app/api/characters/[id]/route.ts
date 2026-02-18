import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const VALID_ID = /^[a-zA-Z0-9_-]{1,24}$/;

/** 캐릭터 상세 조회 — abilities 포함 전체 데이터 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!VALID_ID.test(id)) {
      return NextResponse.json({ error: "INVALID_ID" }, { status: 400 });
    }
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("characters")
      .select(`
        id, name, faction, ability_class,
        hp_max, hp_current, will_max, will_current,
        appearance, backstory, profile_image_url,
        is_leader, resonance_rate, profile_data,
        abilities(id, tier, name, description, weakness, cost_hp, cost_will)
      `)
      .eq("id", id)
      .eq("status", "approved")
      .is("deleted_at", null)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "CHARACTER_NOT_FOUND" },
          { status: 404 },
        );
      }
      console.error("[api/characters/id] 캐릭터 상세 조회 실패:", error.message);
      return NextResponse.json(
        { error: "FAILED_TO_FETCH_CHARACTER" },
        { status: 500 },
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("[api/characters/id] 예상치 못한 에러:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 },
    );
  }
}
