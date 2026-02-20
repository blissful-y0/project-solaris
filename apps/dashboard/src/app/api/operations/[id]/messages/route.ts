import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { mapOperationMessage } from "@/lib/operations/dto";

/**
 * POST /api/operations/[id]/messages
 *
 * Downtime 서술 메시지 전송 API.
 * - 현재 로그인 사용자의 승인 캐릭터를 sender로 고정한다.
 * - 전달받는 content는 trim 후 빈 문자열을 차단한다.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const content = typeof body?.content === "string" ? body.content.trim() : "";

    if (!content) {
      return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
    }

    // 메시지 발신자는 "로그인 사용자의 승인 캐릭터" 하나로 고정한다.
    const { data: myCharacter, error: characterError } = await (supabase as any)
      .from("characters")
      .select("id, name, profile_image_url")
      .eq("user_id", user.id)
      .eq("status", "approved")
      .is("deleted_at", null)
      .maybeSingle();

    if (characterError) {
      console.error("[api/operations/[id]/messages] 캐릭터 조회 실패:", characterError.message);
      return NextResponse.json({ error: "FAILED_TO_FETCH_CHARACTER" }, { status: 500 });
    }

    if (!myCharacter) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }

    const { data: inserted, error: insertError } = await (supabase as any)
      .from("operation_messages")
      .insert({
        id: `msg_${crypto.randomUUID()}`,
        operation_id: id,
        type: "narration",
        sender_character_id: myCharacter.id,
        content,
      })
      .select("id, type, content, created_at, sender_character_id, sender:characters(id, name, profile_image_url)")
      .single();

    if (insertError) {
      console.error("[api/operations/[id]/messages] 메시지 INSERT 실패:", insertError.message);
      return NextResponse.json({ error: "FAILED_TO_SEND_MESSAGE" }, { status: 500 });
    }

    return NextResponse.json(
      {
        data: mapOperationMessage(inserted, myCharacter.id),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[api/operations/[id]/messages] unexpected error:", error);
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
