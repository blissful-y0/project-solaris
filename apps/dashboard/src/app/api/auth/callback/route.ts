import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { envServer } from "@/lib/env.server";

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

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
