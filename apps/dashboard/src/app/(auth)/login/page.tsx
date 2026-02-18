"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const IS_DEV = process.env.NODE_ENV === "development";

/** Discord 로고 — 버튼 내 작은 아이콘용 */
function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devEmail, setDevEmail] = useState("");
  const [devPassword, setDevPassword] = useState("");
  const [devLoading, setDevLoading] = useState(false);

  /** Discord OAuth 로그인 실행 */
  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const callbackUrl = new URL(
        "/api/auth/callback",
        window.location.origin,
      );

      const requestedRedirect = new URL(window.location.href).searchParams.get(
        "redirect",
      );
      const safeRedirectPath =
        requestedRedirect &&
        requestedRedirect.startsWith("/") &&
        !requestedRedirect.startsWith("//")
          ? requestedRedirect
          : "/";

      if (safeRedirectPath !== "/") {
        callbackUrl.searchParams.set("next", safeRedirectPath);
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "discord",
        options: {
          redirectTo: callbackUrl.toString(),
        },
      });

      if (error) {
        setError("인증 요청에 실패했습니다");
      }
    } catch {
      setError("네트워크 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      data-testid="login-card"
      className="hud-corners mx-4 w-full max-w-[420px] rounded-lg border border-border bg-bg-secondary/80 p-6 backdrop-blur-sm sm:p-8"
    >
      {/* 시스템 식별자 */}
      <p className="hud-label text-center">SOLARIS NETWORK</p>
      <div className="mx-auto mt-3 w-16 border-t border-primary/20" />

      {/* 로고 */}
      <h1 className="text-glow-cyan mt-6 text-center text-3xl font-bold tracking-[0.3em] text-primary">
        SOLARIS
      </h1>
      <p className="mt-2 text-center text-xs tracking-widest text-text-secondary">
        OPERATOR AUTHENTICATION REQUIRED
      </p>

      {/* 터미널 스타일 안내 메시지 */}
      <div className="mt-8 rounded border border-border/50 bg-bg/60 px-4 py-3">
        <p className="font-mono text-[0.7rem] leading-relaxed text-text-secondary">
          <span className="text-primary">&gt;</span> 식별 인증이 필요합니다.
          <br />
          <span className="text-primary">&gt;</span> 등록된 통신 채널을 통해 신원을 확인합니다.
        </p>
      </div>

      {/* 인증 버튼 — 서비스 스타일 */}
      <button
        type="button"
        onClick={handleLogin}
        disabled={loading}
        className="mt-6 flex min-h-[48px] w-full cursor-pointer items-center justify-center gap-3 rounded-md border border-primary/30 bg-primary/10 px-4 py-3 font-semibold text-primary transition-all hover:bg-primary/20 hover:glow-cyan disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <>
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span className="text-sm tracking-wide">인증 채널 연결 중...</span>
          </>
        ) : (
          <>
            <DiscordIcon className="opacity-60" />
            <span className="text-sm tracking-wide">통신 채널로 인증</span>
          </>
        )}
      </button>

      {/* 에러 메시지 */}
      {error && (
        <p className="mt-3 text-center text-xs text-accent">{error}</p>
      )}

      {/* DEV 전용 이메일 로그인 */}
      {IS_DEV && (
        <div className="mt-6 border-t border-border/30 pt-4">
          <p className="text-center text-[0.65rem] text-text-secondary/60 mb-3">
            DEV ONLY — EMAIL LOGIN
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setDevLoading(true);
              setError(null);
              try {
                const supabase = createClient();
                const { error: signInError } = await supabase.auth.signInWithPassword({
                  email: devEmail,
                  password: devPassword,
                });
                if (signInError) {
                  setError(signInError.message);
                } else {
                  router.push("/");
                }
              } catch {
                setError("로그인 실패");
              } finally {
                setDevLoading(false);
              }
            }}
            className="space-y-2"
          >
            <input
              type="email"
              placeholder="이메일"
              value={devEmail}
              onChange={(e) => setDevEmail(e.target.value)}
              className="w-full rounded border border-border/50 bg-bg/60 px-3 py-2 text-sm text-text placeholder:text-text-secondary/40 focus:border-primary focus:outline-none"
            />
            <input
              type="password"
              placeholder="비밀번호"
              value={devPassword}
              onChange={(e) => setDevPassword(e.target.value)}
              className="w-full rounded border border-border/50 bg-bg/60 px-3 py-2 text-sm text-text placeholder:text-text-secondary/40 focus:border-primary focus:outline-none"
            />
            <button
              type="submit"
              disabled={devLoading || !devEmail || !devPassword}
              className="w-full rounded border border-warning/30 bg-warning/10 px-3 py-2 text-sm font-medium text-warning transition-colors hover:bg-warning/20 disabled:opacity-50"
            >
              {devLoading ? "로그인 중..." : "DEV 이메일 로그인"}
            </button>
          </form>
        </div>
      )}

      {/* 하단 상태 표시 */}
      <div className="mt-8">
        <div className="mx-auto w-16 border-t border-primary/20" />
        <div className="mt-3 flex items-center justify-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-[pulse-glow_2s_ease-in-out_infinite]" />
          <span className="hud-label text-success">SYSTEM ONLINE</span>
        </div>
      </div>
    </div>
  );
}
