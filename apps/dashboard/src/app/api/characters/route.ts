import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** 승인된 캐릭터 목록 조회 — 카드 표시용 경량 필드만 */
export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("characters")
      .select("id, name, faction, ability_class, profile_image_url, is_leader, user_id")
      .eq("status", "approved")
      .is("deleted_at", null)
      .order("name")
      .limit(200);

    if (error) {
      console.error("[api/characters] 캐릭터 목록 조회 실패:", error.message);
      return NextResponse.json(
        { error: "FAILED_TO_FETCH_CHARACTERS" },
        { status: 500 },
      );
    }

    /* user_id를 클라이언트에 노출하지 않고 is_mine boolean으로 변환 */
    const safe = (data ?? []).map(({ user_id, ...rest }) => ({
      ...rest,
      is_mine: user_id === user.id,
    }));

    return NextResponse.json({ data: safe });
  } catch (error) {
    console.error("[api/characters] 예상치 못한 에러:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 },
    );
  }
}
