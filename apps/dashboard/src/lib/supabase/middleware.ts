import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { envServer } from "@/lib/env.server";

/** 미들웨어에서 세션 갱신 + 인증 리다이렉트 처리 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    envServer.NEXT_PUBLIC_SUPABASE_URL,
    envServer.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isApiPath = pathname.startsWith("/api/");

  const isPublicPath =
    pathname === "/login" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next");

  // 미인증 API 요청은 리다이렉트 대신 401 JSON
  if (!user && isApiPath && !pathname.startsWith("/api/auth")) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  // 미인증 + 비공개 페이지 경로 → 로그인으로
  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    const redirectPath = `${pathname}${request.nextUrl.search}`;
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("redirect", redirectPath);
    return NextResponse.redirect(url);
  }

  // 인증 완료 + 로그인 페이지 → 홈으로
  if (user && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
