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

    const { data, error } = await supabase
      .from("characters")
      .update({ status: "rejected", rejection_reason: body.reason ?? null })
      .eq("id", id)
      .select("id, user_id, status")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "FAILED_TO_REJECT" }, { status: 500 });
    }

    await createNotification({
      userId: data.user_id,
      scope: "user",
      type: "character_rejected",
      title: "캐릭터 반려 안내",
      body: "캐릭터가 반려되었습니다.",
      channel: "discord_dm",
      payload: { characterId: data.id },
    }, supabase);

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
