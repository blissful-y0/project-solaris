"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, Button } from "@/components/ui";
import { BriefingFeed, mockBriefings } from "@/components/home";
import type { User } from "@supabase/supabase-js";
import Image from "next/image";

/** Discord 아바타 URL 추출 */
function getAvatarUrl(user: User): string | null {
  const meta = user.user_metadata;
  if (meta?.avatar_url) return meta.avatar_url;
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
  return meta?.full_name ?? meta?.name ?? meta?.user_name ?? "Operator";
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  // TODO: 실제 캐릭터 데이터는 API 연동 후 교체
  const hasCharacter = false;

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

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
      </div>

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
