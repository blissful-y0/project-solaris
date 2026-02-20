import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { createNotification } from "@/app/actions/notification";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { supabase } = await requireAdmin();
    const { id } = await params;

    // 정책 의도: 관리자 재판정 허용.
    // 이미 approved/rejected 상태인 캐릭터도 필요 시 다시 approve 할 수 있다.
    // (재신청/재심 운영 흐름을 지원하기 위해 pending 조건을 고정하지 않음)
    const { data, error } = await supabase
      .from("characters")
      .update({ status: "approved", rejection_reason: null })
      .eq("id", id)
      .select("id, user_id, status")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "FAILED_TO_APPROVE" }, { status: 500 });
    }

    try {
      await createNotification({
        userId: data.user_id,
        scope: "user",
        type: "character_approved",
        title: "캐릭터 승인 완료",
        body: "캐릭터가 승인되었습니다.",
        channel: "discord_dm",
        payload: { characterId: data.id },
      }, supabase);
    } catch (notifError) {
      console.error("[admin/approve] 알림 생성 실패 (승인은 완료):", notifError);
    }

    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }

    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
