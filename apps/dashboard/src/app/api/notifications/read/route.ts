import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface MarkReadBody {
  notificationId?: string;
  all?: boolean;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const body = (await request.json()) as MarkReadBody;
  const now = new Date().toISOString();

  if (body.notificationId) {
    const { error } = await supabase
      .from("notifications")
      .update({ read_at: now })
      .eq("id", body.notificationId)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: "FAILED_TO_MARK_AS_READ" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  }

  if (body.all) {
    const { error } = await supabase
      .from("notifications")
      .update({ read_at: now })
      .eq("user_id", user.id)
      .eq("scope", "user")
      .is("read_at", null);

    if (error) {
      return NextResponse.json({ error: "FAILED_TO_MARK_ALL_AS_READ" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
}
