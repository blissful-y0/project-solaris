import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { supabase } = await requireAdmin();
    const { id } = await params;

    const { data: current, error: currentError } = await supabase
      .from("characters")
      .select("id, is_leader")
      .eq("id", id)
      .single();

    if (currentError || !current) {
      return NextResponse.json({ error: "CHARACTER_NOT_FOUND" }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("characters")
      .update({ is_leader: !current.is_leader })
      .eq("id", id)
      .select("id, is_leader")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "FAILED_TO_TOGGLE_LEADER" }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }

    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
}
