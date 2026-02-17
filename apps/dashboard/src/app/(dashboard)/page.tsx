"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui";
import { BriefingFeed, mockBriefings } from "@/components/home";
import type { User } from "@supabase/supabase-js";
import Image from "next/image";

/** Discord 아바타 URL 추출 */
function getAvatarUrl(user: User): string | null {
  const meta = user.user_metadata;
  if (typeof meta?.avatar_url === "string") {
    try {
      const url = new URL(meta.avatar_url);
      if (
        url.protocol === "https:" &&
        (url.hostname === "cdn.discordapp.com" ||
          url.hostname === "media.discordapp.net")
      ) {
        return meta.avatar_url;
      }
    } catch {
      return null;
    }
  }
  const discordId = meta?.provider_id ?? meta?.sub;
  const avatarHash = meta?.avatar;
  if (discordId && avatarHash) {
    return `https://cdn.discordapp.com/avatars/${discordId}/${avatarHash}.png?size=128`;
  }
  return null;
}

/** 표시 이름 추출 — 캐릭터 이름 우선, 없으면 Discord 아이디 */
function getDisplayName(user: User): string {
  const meta = user.user_metadata;
  const rawName =
    meta?.full_name ?? meta?.name ?? meta?.user_name ?? meta?.preferred_username;
  if (typeof rawName !== "string") return "Operator";

  const sanitized = rawName.replace(/[\u0000-\u001F\u007F]/g, "").trim();
  if (!sanitized) return "Operator";

  return sanitized.slice(0, 27);
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const hasFetchedRef = useRef(false);
  // TODO: 실제 캐릭터 데이터는 API 연동 후 교체
  const hasCharacter = false;

  const fetchUser = useCallback(async () => {
    const supabase = createClient();
    setIsLoading(true);
    setLoadError(false);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    } catch {
      setUser(null);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    void fetchUser();
  }, [fetchUser]);

  const avatarUrl = user ? getAvatarUrl(user) : null;
  const displayName = user ? getDisplayName(user) : "...";

  return (
    <div className="py-6">
      {/* 환영 메시지 */}
      <div className="mb-6">
        <p className="hud-label mb-2">OPERATOR STATUS</p>
        <h1 className="text-xl font-bold text-text">
          환영합니다, <span className="text-primary">{displayName}</span>님
        </h1>
        {isLoading && (
          <p className="mt-2 text-sm text-text-secondary">
            사용자 정보를 불러오는 중...
          </p>
        )}
      </div>

      {loadError && (
        <Card hud className="mb-4 max-w-md border border-red-500/40">
          <p className="text-sm text-text">사용자 정보를 불러오지 못했습니다.</p>
          <button
            type="button"
            onClick={() => {
              void fetchUser();
            }}
            className="mt-3 rounded-md border border-border px-3 py-1.5 text-sm text-text hover:border-primary hover:text-primary"
          >
            다시 시도
          </button>
        </Card>
      )}

      {/* 프로필 카드 */}
      <Card hud className="max-w-md">
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="프로필"
              width={56}
              height={56}
              className="h-14 w-14 rounded-lg border border-border"
            />
          ) : (
            <div className="h-14 w-14 rounded-lg border border-border bg-bg-tertiary" />
          )}
          <div className="flex-1">
            <p className="font-semibold text-text">{displayName}</p>
            <p className="text-xs text-text-secondary">
              {user?.email ?? "Discord 연동 계정"}
            </p>
          </div>
        </div>

        {/* 캐릭터 미등록 시 생성 유도 */}
        {!hasCharacter && (
          <Link href="/character/create" className="block mt-4">
            <div className="group relative overflow-hidden rounded-lg border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 transition-all hover:border-primary/60 hover:glow-cyan cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="hud-label mb-1 group-hover:text-primary transition-colors">NEW OPERATIVE REQUIRED</p>
                  <p className="text-sm font-semibold text-text">캐릭터 등록</p>
                </div>
                <span className="text-primary text-lg group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
              {/* 장식 스캔라인 */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,212,255,0.03)_50%)] bg-[length:100%_4px]" />
            </div>
          </Link>
        )}
      </Card>

      {/* 브리핑 타임라인 */}
      <div className="mt-8">
        <BriefingFeed briefings={mockBriefings} />
      </div>
    </div>
  );
}
