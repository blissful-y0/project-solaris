import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { createNotification } from "@/app/actions/notification";

interface RejectBody {
  reason?: string;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { supabase } = await requireAdmin();
    const { id } = await params;
    const body = (await request.json()) as RejectBody;
    const reason = body.reason?.trim() ?? "";

    if (reason.length < 20) {
      return NextResponse.json(
        { error: "REASON_TOO_SHORT", min: 20 },
        { status: 400 },
      );
    }

    // 정책 의도: 관리자 재판정 허용.
    // 이미 approved/rejected 상태인 캐릭터도 필요 시 다시 reject 할 수 있다.
    // (재신청/재심 운영 흐름을 지원하기 위해 pending 조건을 고정하지 않음)
    const { data, error } = await supabase
      .from("characters")
      .update({ status: "rejected", rejection_reason: reason })
      .eq("id", id)
      .select("id, user_id, status, name")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "FAILED_TO_REJECT" }, { status: 500 });
    }

    try {
      await createNotification({
        userId: data.user_id,
        scope: "user",
        type: "character_rejected",
        title: "[SOLARIS] 캐릭터 반려 안내",
        body: `캐릭터 **${data.name}**이(가) 반려되었습니다.\n\n반려 사유: ${reason}`,
        channel: "discord_dm",
        payload: { characterId: data.id },
      }, supabase);
    } catch (notifError) {
      console.error("[admin/reject] 알림 생성 실패 (반려는 완료):", notifError);
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
