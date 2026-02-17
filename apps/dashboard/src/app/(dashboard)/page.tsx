"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui";
import {
  BriefingFeed,
  mockBriefings,
  CitizenIDCard,
  mockCitizen,
  ResonanceTasks,
  mockTasks,
} from "@/components/home";
import type { User } from "@supabase/supabase-js";

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

  return sanitized.slice(0, 32);
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  // TODO: 실제 캐릭터 데이터는 API 연동 후 교체
  const hasCharacter = false;

  const fetchUser = useCallback(async (isCancelled?: () => boolean) => {
    const supabase = createClient();
    setIsLoading(true);
    setLoadError(false);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (isCancelled?.()) return;
      setUser(user);
    } catch {
      if (isCancelled?.()) return;
      setUser(null);
      setLoadError(true);
    } finally {
      if (isCancelled?.()) return;
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetchUser(() => cancelled);
    return () => {
      cancelled = true;
    };
  }, [fetchUser]);

  const avatarUrl = user ? getAvatarUrl(user) : null;
  const displayName = user ? getDisplayName(user) : "...";

  /* 목 시민 데이터에 실제 유저 아바타 반영 */
  const citizenData = hasCharacter
    ? { ...mockCitizen, avatarUrl }
    : null;

  return (
    <div className="py-6 space-y-8">
      {/* 환영 메시지 */}
      <div>
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
        <Card hud className="max-w-md border border-red-500/40">
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

      {/* 상단: ID 카드 + Tasks (데스크탑에서 나란히) */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CitizenIDCard citizen={citizenData} />
        <ResonanceTasks tasks={mockTasks} />
      </div>

      {/* 하단: 뉴스 피드 */}
      <BriefingFeed briefings={mockBriefings} />
    </div>
  );
}
