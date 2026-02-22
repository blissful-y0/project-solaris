import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { isValidId } from "@/lib/api/validate-id";

/** 캐릭터 단건 조회 (status 무관) */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { supabase } = await requireAdmin();
    const { id } = await params;
    if (!isValidId(id)) {
      return NextResponse.json({ error: "INVALID_ID" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("characters")
      .select("*, abilities(*)")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }

    console.error("[admin/characters/:id] 예상치 못한 에러:", error);
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
