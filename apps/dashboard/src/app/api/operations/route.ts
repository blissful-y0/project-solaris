import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { mapOperationListItem } from "@/lib/operations/dto";

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
      .in("operation_id", operationIds);

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
