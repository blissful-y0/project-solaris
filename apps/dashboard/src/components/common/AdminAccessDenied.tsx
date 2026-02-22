import Link from "next/link";

import { Button, Card } from "@/components/ui";

export function AdminAccessDenied() {
  return (
    <section className="py-10">
      <Card hud className="max-w-xl border-accent/40">
        <p className="hud-label mb-2 text-accent">ADMIN GUARD</p>
        <h1 className="text-xl font-bold text-text">ACCESS DENIED</h1>
        <p className="mt-2 text-sm text-text-secondary">
          관리자 권한이 없어 이 페이지에 접근할 수 없습니다.
        </p>
        <div className="mt-4">
          <Link href="/">
            <Button variant="secondary" size="sm">홈으로 돌아가기</Button>
          </Link>
        </div>
      </Card>
    </section>
  );
}
