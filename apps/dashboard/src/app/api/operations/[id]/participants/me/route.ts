import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isValidId } from "@/lib/api/validate-id";

/**
 * DELETE /api/operations/[id]/participants/me
 *
 * 내 참가 행을 soft delete 처리한다.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: operationId } = await params;
    if (!isValidId(operationId)) {
      return NextResponse.json({ error: "INVALID_ID" }, { status: 400 });
    }
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }

    const { data: myCharacter, error: myCharacterError } = await supabase
      .from("characters")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "approved")
      .is("deleted_at", null)
      .maybeSingle();

    if (myCharacterError) {
      return NextResponse.json({ error: "FAILED_TO_FETCH_CHARACTER" }, { status: 500 });
    }

    if (!myCharacter) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }

    const { data: existing, error: existingError } = await supabase
      .from("operation_participants")
      .select("id")
      .eq("operation_id", operationId)
      .eq("character_id", myCharacter.id)
      .is("deleted_at", null)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json(
        { error: "FAILED_TO_FETCH_OPERATION_PARTICIPANT" },
        { status: 500 },
      );
    }

    if (!existing) {
      return NextResponse.json({ data: { left: false } }, { status: 200 });
    }

    const { error: updateError } = await supabase
      .from("operation_participants")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", existing.id)
      .is("deleted_at", null);

    if (updateError) {
      return NextResponse.json({ error: "FAILED_TO_LEAVE_OPERATION" }, { status: 500 });
    }

    return NextResponse.json({ data: { left: true } }, { status: 200 });
  } catch (error) {
    console.error("[api/operations/[id]/participants/me] unexpected error:", error);
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
