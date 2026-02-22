import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { isValidId } from "@/lib/api/validate-id";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { supabase } = await requireAdmin();
    const { id } = await params;
    if (!isValidId(id)) {
      return NextResponse.json({ error: "INVALID_ID" }, { status: 400 });
    }

    const { data: current, error: currentError } = await supabase
      .from("characters")
      .select("id, is_leader, status")
      .eq("id", id)
      .single();

    if (currentError || !current) {
      return NextResponse.json({ error: "CHARACTER_NOT_FOUND" }, { status: 404 });
    }
    if (current.status !== "approved") {
      return NextResponse.json({ error: "CHARACTER_NOT_APPROVED" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("characters")
      .update({ is_leader: !current.is_leader })
      .eq("id", id)
      .select("id, is_leader")
      .single();

    if (error?.code === "23505") {
      return NextResponse.json({ error: "FACTION_LEADER_ALREADY_EXISTS" }, { status: 409 });
    }
    if (error || !data) {
      return NextResponse.json({ error: "FAILED_TO_TOGGLE_LEADER" }, { status: 500 });
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
