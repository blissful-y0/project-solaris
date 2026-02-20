"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";
import { Button, Card } from "@/components/ui";

export default function MyPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

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
    <section className="pb-6">
      <div className="mb-6">
        <p className="hud-label mb-2">MY PAGE</p>
        <h1 className="text-xl font-bold text-text">마이페이지</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card hud>
          <p className="hud-label mb-3 text-primary">OPERATOR PROFILE</p>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-text-secondary">이름</p>
              <p className="font-semibold text-text">{displayName}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">이메일</p>
              <p className="text-sm text-text">{user?.email ?? "Discord 연동 계정"}</p>
            </div>
          </div>
        </Card>

        <Card hud>
          <p className="hud-label mb-3">ACCOUNT SETTINGS</p>
          <p className="text-xs text-text-secondary">
            계정 설정 및 프로필 관리 기능을 준비하고 있습니다.
          </p>
        </Card>

        <Card hud>
          <p className="hud-label mb-3 text-accent">SESSION CONTROL</p>
          <p className="mb-4 text-xs text-text-secondary">
            현재 세션을 종료하고 로그아웃합니다.
          </p>
          <Button variant="danger" onClick={handleLogout} className="w-full">
            로그아웃
          </Button>
        </Card>
      </div>
    </section>
  );
}
