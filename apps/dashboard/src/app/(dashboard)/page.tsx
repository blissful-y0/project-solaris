"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui";
import type { User } from "@supabase/supabase-js";

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

/** 표시 이름 추출 */
function getDisplayName(user: User): string {
  const meta = user.user_metadata;
  return meta?.full_name ?? meta?.name ?? meta?.user_name ?? "Operator";
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);

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
      <div className="mb-8">
        <p className="hud-label mb-2">OPERATOR STATUS</p>
        <h1 className="text-xl font-bold text-text">
          환영합니다, <span className="text-primary">{displayName}</span>
        </h1>
      </div>

      {/* 유저 카드 */}
      <Card hud className="max-w-md">
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="프로필"
              className="h-14 w-14 rounded-lg border border-border"
            />
          ) : (
            <div className="h-14 w-14 rounded-lg border border-border bg-bg-tertiary" />
          )}
          <div>
            <p className="font-semibold text-text">{displayName}</p>
            <p className="text-xs text-text-secondary">
              {user?.email ?? "Discord 연동 계정"}
            </p>
          </div>
        </div>
      </Card>

      {/* 준비 중 안내 */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {[
          { title: "캐릭터 생성", desc: "나만의 캐릭터를 만들고 승인받으세요" },
          { title: "전투 시스템", desc: "AI GM이 판정하는 텍스트 전투" },
          { title: "RP 채팅방", desc: "자유로운 역할극과 서사 반영" },
          { title: "캐릭터 도감", desc: "승인된 캐릭터들을 둘러보세요" },
        ].map((item) => (
          <Card key={item.title} variant="interactive">
            <p className="text-xs uppercase tracking-widest text-primary/80 mb-1 font-semibold">
              {item.title}
            </p>
            <p className="text-sm text-text-secondary">{item.desc}</p>
            <p className="mt-2 text-[0.625rem] text-text-secondary/50 uppercase tracking-wide">
              Coming Soon
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
