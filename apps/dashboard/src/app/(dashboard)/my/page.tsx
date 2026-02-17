"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, Button } from "@/components/ui";

export default function MyPage() {
  const router = useRouter();

  /** 로그아웃 처리: 세션 해제 후 /login으로 리다이렉트 */
  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="py-6">
      <p className="hud-label mb-2">MY PAGE</p>
      <h1 className="text-xl font-bold text-text mb-6">마이페이지</h1>

      <Card hud className="max-w-md">
        <div className="space-y-4">
          <p className="text-text-secondary text-sm">
            계정 설정 및 프로필 관리 기능을 준비하고 있습니다.
          </p>

          <div className="border-t border-border pt-4">
            <Button
              variant="danger"
              onClick={handleLogout}
              className="w-full"
            >
              로그아웃
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
