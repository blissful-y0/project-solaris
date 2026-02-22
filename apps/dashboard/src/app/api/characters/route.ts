import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** 승인된 캐릭터 목록 조회 — 카드 표시용 경량 필드만 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const rawLimit = Number(searchParams.get("limit") ?? 20);
    const rawOffset = Number(searchParams.get("offset") ?? 0);
    const limit = Number.isFinite(rawLimit) ? Math.min(100, Math.max(1, Math.floor(rawLimit))) : 20;
    const offset = Number.isFinite(rawOffset) ? Math.max(0, Math.floor(rawOffset)) : 0;

    const { data, error } = await supabase
      .from("characters")
      .select("id, name, faction, ability_class, profile_image_url, is_leader, user_id")
      .eq("status", "approved")
      .is("deleted_at", null)
      .order("name")
      .range(offset, offset + limit - 1);

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

    const hasMore = safe.length === limit;
    return NextResponse.json({
      data: safe,
      page: {
        limit,
        offset,
        hasMore,
        nextOffset: hasMore ? offset + limit : null,
      },
    });
  } catch (error) {
    console.error("[api/characters] 예상치 못한 에러:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 },
    );
  }
}
