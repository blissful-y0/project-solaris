import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { closeEncounterSchema } from "@/lib/operations/battle/schemas";
import { isValidId } from "@/lib/api/validate-id";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!isValidId(id)) {
      return NextResponse.json({ error: "INVALID_ID" }, { status: 400 });
    }
    const body = await request.json();
    const parsed = closeEncounterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_REQUEST", issues: parsed.error.issues }, { status: 400 });
    }

    const { supabase, user } = await requireAdmin();

    const { data, error } = await supabase
      .from("operation_encounters")
      .update({
        status: "completed",
        result: parsed.data.result,
        ended_at: new Date().toISOString(),
        gm_closed_by: user.id,
      })
      .eq("id", id)
      .is("deleted_at", null)
      .select("id, status, result, ended_at")
      .single();

    if (error) {
      return NextResponse.json({ error: "FAILED_TO_CLOSE_ENCOUNTER" }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }

    console.error("[operation/close] unexpected error", error);
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
