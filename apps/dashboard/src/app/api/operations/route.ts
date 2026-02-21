import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { mapOperationListItem } from "@/lib/operations/dto";
import { nanoid } from "nanoid";

/**
 * GET /api/operations
 *
 * Phase 1(Downtime) 기준 목록 조회 API.
 * - 인증 유저만 조회 가능
 * - type/status 쿼리 필터 지원
 * - 프론트 카드에서 바로 사용 가능한 camelCase 응답으로 변환
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const status = searchParams.get("status");

    let query = (supabase as any)
      .from("operations")
      .select(
        "id, title, type, status, summary, is_main_story, max_participants, created_at, created_by",
      )
      .is("deleted_at", null);

    if (type && type !== "all") {
      query = query.eq("type", type);
    }

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    query = query.order("created_at", { ascending: false });

    const { data: operations, error } = await query;

    if (error) {
      console.error("[api/operations] 목록 조회 실패:", error.message);
      return NextResponse.json({ error: "FAILED_TO_FETCH_OPERATIONS" }, { status: 500 });
    }

    const operationIds = (operations ?? []).map((item: { id: string }) => item.id);

    if (operationIds.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const { data: participants, error: participantsError } = await (supabase as any)
      .from("operation_participants")
      .select("operation_id, team, character:characters(id, name)")
      .in("operation_id", operationIds)
      .is("deleted_at", null);

    if (participantsError) {
      console.error("[api/operations] 참가자 조회 실패:", participantsError.message);
      return NextResponse.json(
        { error: "FAILED_TO_FETCH_OPERATION_PARTICIPANTS" },
        { status: 500 },
      );
    }

    const participantsByOperation = new Map<string, any[]>();
    for (const row of participants ?? []) {
      const current = participantsByOperation.get(row.operation_id) ?? [];
      current.push(row);
      participantsByOperation.set(row.operation_id, current);
    }

    const data = (operations ?? []).map((row: any) =>
      mapOperationListItem(row, participantsByOperation.get(row.id) ?? []),
    );

    return NextResponse.json({ data });
  } catch (error) {
    console.error("[api/operations] unexpected error:", error);
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}

/**
 * POST /api/operations
 *
 * 새 작전/다운타임 방을 생성한다.
 * - 승인된 캐릭터가 있어야 생성 가능
 * - created_by: 생성자 캐릭터 ID
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }

    const { data: myCharacter, error: characterError } = await (supabase as any)
      .from("characters")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "approved")
      .is("deleted_at", null)
      .maybeSingle();

    if (characterError) {
      return NextResponse.json({ error: "FAILED_TO_FETCH_CHARACTER" }, { status: 500 });
    }

    if (!myCharacter) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const type = body?.type;
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const summary = typeof body?.summary === "string" ? body.summary.trim() : "";

    if (!type || !["operation", "downtime"].includes(type)) {
      return NextResponse.json({ error: "INVALID_TYPE" }, { status: 400 });
    }

    if (!title || title.length < 1 || title.length > 100) {
      return NextResponse.json({ error: "INVALID_TITLE" }, { status: 400 });
    }

    const id = `op_${nanoid(12)}`;

    const { data: inserted, error: insertError } = await (supabase as any)
      .from("operations")
      .insert({
        id,
        title,
        type,
        summary: summary || null,
        status: "waiting",
        is_main_story: false,
        // DB CHECK 제약(2~12)을 준수해야 insert가 실패하지 않는다.
        max_participants: type === "operation" ? 4 : 8,
        created_by: myCharacter.id,
      })
      .select("id, title, type, status, summary, is_main_story, max_participants, created_at, created_by")
      .single();

    if (insertError) {
      console.error("[api/operations] 작전 생성 실패:", insertError.message);
      return NextResponse.json({ error: "FAILED_TO_CREATE_OPERATION" }, { status: 500 });
    }

    return NextResponse.json(
      { data: mapOperationListItem(inserted, []) },
      { status: 201 },
    );
  } catch (error) {
    console.error("[api/operations] POST unexpected error:", error);
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
