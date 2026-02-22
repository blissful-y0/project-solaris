import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function resolveDisplayName(user: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}) {
  const raw =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.user_metadata?.user_name ??
    user.user_metadata?.preferred_username;

  if (typeof raw === "string") {
    const sanitized = raw.replace(/[\u0000-\u001F\u007F]/g, "").trim();
    if (sanitized.length > 0) {
      return sanitized.slice(0, 32);
    }
  }

  if (typeof user.email === "string" && user.email.length > 0) {
    return user.email;
  }

  return `user-${user.id.slice(0, 8)}`;
}

/** 로그인 사용자 + 내 캐릭터를 한 번에 조회 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }

    const [{ data: userRow }, { data: character, error }] = await Promise.all([
      supabase
        .from("users")
        .select("discord_username, role")
        .eq("id", user.id)
        .single(),
      supabase
        .from("characters")
        .select(
          "id, name, status, profile_image_url, faction, ability_class, hp_max, hp_current, will_max, will_current, resonance_rate, created_at",
        )
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .maybeSingle(),
    ]);

    if (error) {
      return NextResponse.json({ error: "FAILED_TO_FETCH_ME" }, { status: 500 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email ?? null,
        displayName: resolveDisplayName(user),
        discordUsername: userRow?.discord_username ?? null,
        isAdmin: userRow?.role === "admin",
      },
      character: character ?? null,
    });
  } catch (error) {
    console.error("[api/me] unexpected error", error);
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
