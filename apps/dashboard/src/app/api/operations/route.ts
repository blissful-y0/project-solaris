import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServiceClient } from "@/lib/supabase/service";
import { mapOperationListItem, type DbOperationRow, type DbParticipantRow } from "@/lib/operations/dto";
import { nanoid } from "nanoid";

/**
 * GET /api/operations
 *
 * Phase 1(Downtime) 기준 목록 조회 API.
 * - 인증 유저만 조회 가능
 * - type/status 쿼리 필터 지원
 * - 프론트 카드에서 바로 사용 가능한 camelCase 응답으로 변환
 */
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
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const rawLimit = Number(searchParams.get("limit") ?? 20);
    const rawOffset = Number(searchParams.get("offset") ?? 0);
    const limit = Number.isFinite(rawLimit) ? Math.min(50, Math.max(1, Math.floor(rawLimit))) : 20;
    const offset = Number.isFinite(rawOffset) ? Math.max(0, Math.floor(rawOffset)) : 0;

    let query = supabase
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

    query = query.order("created_at", { ascending: false }).range(offset, offset + limit - 1);

    const { data: operations, error } = await query;

    if (error) {
      console.error("[api/operations] 목록 조회 실패:", error.message);
      return NextResponse.json({ error: "FAILED_TO_FETCH_OPERATIONS" }, { status: 500 });
    }

    const operationRows = (operations ?? []) as DbOperationRow[];
    const operationIds = operationRows.map((item) => item.id);

    if (operationIds.length === 0) {
      return NextResponse.json({
        data: [],
        page: {
          limit,
          offset,
          hasMore: false,
          nextOffset: null,
        },
      });
    }

    const { data: participants, error: participantsError } = await supabase
      .from("operation_participants")
      .select("operation_id, team, character:characters(id, name, faction)")
      .in("operation_id", operationIds)
      .is("deleted_at", null);

    if (participantsError) {
      console.error("[api/operations] 참가자 조회 실패:", participantsError.message);
      return NextResponse.json(
        { error: "FAILED_TO_FETCH_OPERATION_PARTICIPANTS" },
        { status: 500 },
      );
    }

    const participantRows = (participants ?? []) as DbParticipantRow[];
    const participantsByOperation = new Map<string, DbParticipantRow[]>();
    for (const row of participantRows) {
      const current = participantsByOperation.get(row.operation_id) ?? [];
      current.push(row);
      participantsByOperation.set(row.operation_id, current);
    }

    const data = operationRows.map((row) =>
      mapOperationListItem(row, participantsByOperation.get(row.id) ?? []),
    );

    const hasMore = operationRows.length === limit;
    return NextResponse.json({
      data,
      page: {
        limit,
        offset,
        hasMore,
        nextOffset: hasMore ? offset + limit : null,
      },
    });
  } catch (error) {
    console.error("[api/operations] unexpected error:", error);
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}

/**
 * POST /api/operations
 *
 * 새 작전/다운타임 방을 생성한다.
 * - operation: admin만 생성 가능 (admin은 캐릭터 없음, created_by: null)
 * - downtime: 승인된 캐릭터가 있는 유저면 누구나 생성 가능
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
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

    if (type === "operation") {
      // operation: admin만 생성 가능
      const { data: userRow, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (userError) {
        console.error("[api/operations] users 조회 실패:", userError.message);
        return NextResponse.json({ error: "ADMIN_CHECK_FAILED" }, { status: 500 });
      }

      if (userRow?.role !== "admin") {
        return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
      }

      // admin은 캐릭터 없음 → service client로 RLS 우회 (created_by: null)
      const serviceClient = getServiceClient();
      const { data: inserted, error: insertError } = await serviceClient
        .from("operations")
        .insert({
          id,
          title,
          type,
          summary,
          status: "waiting",
          is_main_story: false,
          max_participants: 4,
          created_by: null,
        })
        .select("id, title, type, status, summary, is_main_story, max_participants, created_at, created_by")
        .single();

      if (insertError) {
        console.error("[api/operations] 작전 생성 실패:", insertError.message);
        return NextResponse.json({ error: "FAILED_TO_CREATE_OPERATION" }, { status: 500 });
      }

      return NextResponse.json(
        { data: mapOperationListItem(inserted as DbOperationRow, []) },
        { status: 201 },
      );
    }

    // downtime: 승인 캐릭터 필요
    const { data: myCharacter, error: characterError } = await supabase
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

    const { data: inserted, error: insertError } = await supabase
      .from("operations")
      .insert({
        id,
        title,
        type,
        summary,
        status: "waiting",
        is_main_story: false,
        max_participants: 8,
        created_by: myCharacter.id,
      })
      .select("id, title, type, status, summary, is_main_story, max_participants, created_at, created_by")
      .single();

    if (insertError) {
      console.error("[api/operations] 다운타임 생성 실패:", insertError.message);
      return NextResponse.json({ error: "FAILED_TO_CREATE_OPERATION" }, { status: 500 });
    }

    return NextResponse.json(
      { data: mapOperationListItem(inserted as DbOperationRow, []) },
      { status: 201 },
    );
  } catch (error) {
    console.error("[api/operations] POST unexpected error:", error);
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
