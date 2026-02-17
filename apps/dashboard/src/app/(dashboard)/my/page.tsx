"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, Button } from "@/components/ui";
import type { User } from "@supabase/supabase-js";

export default function MyPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  /** 로그아웃 처리: 세션 해제 후 /login으로 리다이렉트 */
  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const displayName =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.user_metadata?.user_name ??
    "Operator";

  return (
    <div className="py-6">
      <div className="mb-6">
        <p className="hud-label mb-2">MY PAGE</p>
        <h1 className="text-xl font-bold text-text">마이페이지</h1>
      </div>

      {/* 데스크탑: 2열 / 모바일: 1열 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* 프로필 카드 */}
        <Card hud>
          <p className="hud-label mb-3 text-primary">OPERATOR PROFILE</p>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-text-secondary">이름</p>
              <p className="font-semibold text-text">{displayName}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">이메일</p>
              <p className="text-sm text-text">
                {user?.email ?? "Discord 연동 계정"}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">인증 방식</p>
              <p className="text-sm text-text">Discord OAuth</p>
            </div>
          </div>
        </Card>

        {/* 계정 설정 카드 */}
        <Card hud>
          <p className="hud-label mb-3">ACCOUNT SETTINGS</p>
          <div className="space-y-3">
            <p className="text-xs text-text-secondary">
              계정 설정 및 프로필 관리 기능을 준비하고 있습니다.
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary">알림 설정</span>
                <span className="text-text-secondary">준비 중</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary">테마 설정</span>
                <span className="text-text-secondary">준비 중</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary">캐릭터 관리</span>
                <span className="text-text-secondary">준비 중</span>
              </div>
            </div>
          </div>
        </Card>

        {/* 세션 관리 카드 */}
        <Card hud>
          <p className="hud-label mb-3 text-accent">SESSION CONTROL</p>
          <div className="space-y-4">
            <p className="text-xs text-text-secondary">
              현재 세션을 종료하고 로그아웃합니다.
            </p>
            <Button
              variant="danger"
              onClick={handleLogout}
              className="w-full"
            >
              로그아웃
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
