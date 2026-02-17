import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

type AuthState = "loading" | "loggedOut" | "loggedIn";

const DiscordIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
  </svg>
);

function getDiscordAvatarUrl(user: User): string | null {
  const meta = user.user_metadata;
  if (meta?.avatar_url) return meta.avatar_url;
  const discordId = meta?.provider_id ?? meta?.sub;
  const avatarHash = meta?.avatar;
  if (discordId && avatarHash) {
    return `https://cdn.discordapp.com/avatars/${discordId}/${avatarHash}.png?size=64`;
  }
  return null;
}

function getDisplayName(user: User): string {
  const meta = user.user_metadata;
  return `@${meta?.full_name ?? meta?.name ?? meta?.user_name ?? "User"}`;
}

export default function AuthButton() {
  const [authState, setAuthState] = useState<AuthState>("loading");
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!supabase) {
      setAuthState("loggedOut");
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setAuthState("loggedIn");
      } else {
        setAuthState("loggedOut");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setAuthState("loggedIn");
      } else {
        setUser(null);
        setAuthState("loggedOut");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 바깥 클릭 시 메뉴 닫기
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const handleLogin = async () => {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: { redirectTo: window.location.origin },
    });
  };

  const handleLogout = async () => {
    if (!supabase) return;
    setMenuOpen(false);
    await supabase.auth.signOut();
  };

  const avatarUrl = user ? getDiscordAvatarUrl(user) : null;

  if (authState === "loading") {
    return (
      <div className="header-discord" aria-label="로그인 확인 중">
        <DiscordIcon />
      </div>
    );
  }

  if (authState === "loggedOut") {
    return (
      <button
        className="header-discord"
        onClick={handleLogin}
        aria-label="Discord로 로그인"
        type="button"
      >
        <DiscordIcon />
      </button>
    );
  }

  return (
    <div ref={wrapperRef} style={{ position: "relative" }}>
      <button
        className="header-discord"
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label="유저 메뉴"
        aria-expanded={menuOpen}
        type="button"
        style={{ padding: 0, overflow: "hidden" }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="프로필"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "0.5rem",
            }}
          />
        ) : (
          <DiscordIcon />
        )}
      </button>

      {menuOpen && (
        <div className="auth-dropdown">
          <span className="auth-dropdown-name">
            {user ? getDisplayName(user) : ""}
          </span>
          <button
            className="auth-dropdown-logout"
            onClick={handleLogout}
            type="button"
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}
