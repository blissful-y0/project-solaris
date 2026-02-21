import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { envServer } from "@/lib/env.server";
import { getServiceClient } from "@/lib/supabase/service";
import { createNotification } from "@/app/actions/notification";

function isSafeInternalPath(path: string) {
  return path.startsWith("/") && !path.startsWith("//");
}

/** Discord OAuth 콜백 — code를 세션으로 교환 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/";
  const next = isSafeInternalPath(rawNext) ? rawNext : "/";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      envServer.NEXT_PUBLIC_SUPABASE_URL,
      envServer.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          },
        },
      },
    );

    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.redirect(`${origin}/login?error=auth_failed`);
      }

      const discordId =
        (typeof user.user_metadata?.provider_id === "string" &&
        user.user_metadata.provider_id.length > 0
          ? user.user_metadata.provider_id
          : undefined) ??
        (typeof user.user_metadata?.sub === "string" && user.user_metadata.sub.length > 0
          ? user.user_metadata.sub
          : undefined);
      if (!discordId) {
        return NextResponse.redirect(`${origin}/login?error=auth_failed`);
      }
      const discordUsername =
        (typeof user.user_metadata?.full_name === "string" &&
        user.user_metadata.full_name.length > 0
          ? user.user_metadata.full_name
          : undefined) ??
        (typeof user.user_metadata?.name === "string" &&
        user.user_metadata.name.length > 0
          ? user.user_metadata.name
          : undefined) ??
        user.email ??
        `user-${user.id.slice(0, 8)}`;

      // 신규 회원 여부 확인 (upsert 전)
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();
      const isNewUser = !existingUser;

      const { error: upsertError } = await supabase.from("users").upsert(
        {
          id: user.id,
          discord_id: discordId,
          discord_username: discordUsername,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );

      if (upsertError) {
        return NextResponse.redirect(`${origin}/login?error=auth_failed`);
      }

      // 신규 회원 가입 시 어드민 웹훅 알림 (실패해도 로그인 차단 안 함)
      if (isNewUser) {
        try {
          await createNotification(
            {
              userId: null,
              scope: "broadcast",
              type: "character_new_member",
              channel: "discord_webhook",
              title: "[신규 가입] 새 회원 등록",
              body: `Discord: @${discordUsername}`,
            },
            getServiceClient(),
          );
        } catch (notifError) {
          console.error("[auth/callback] 신규 회원 웹훅 알림 실패:", notifError);
        }
      }

      // Discord 서버 자동 가입 (실패해도 로그인 차단 안 함)
      const guildId = process.env.DISCORD_GUILD_ID;
      const botToken = process.env.DISCORD_BOT_TOKEN;
      const providerToken = session?.provider_token;

      if (guildId && botToken && providerToken && discordId) {
        try {
          const guildRes = await fetch(
            `https://discord.com/api/v10/guilds/${guildId}/members/${discordId}`,
            {
              method: "PUT",
              headers: {
                "content-type": "application/json",
                authorization: `Bot ${botToken}`,
              },
              body: JSON.stringify({ access_token: providerToken }),
            },
          );
          // 201: 추가됨, 204: 이미 멤버 — 둘 다 정상
          if (!guildRes.ok && guildRes.status !== 204) {
            console.error(
              `[auth/callback] Discord 길드 가입 실패: ${guildRes.status}`,
            );
          }
        } catch (guildError) {
          console.error("[auth/callback] Discord 길드 가입 오류:", guildError);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
