import Link from "next/link";
import { Lock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";

type AccessDeniedProps = {
  characterStatus: "pending" | "rejected" | null;
  className?: string;
};

/** 접근 거부 안내 — 캐릭터 상태에 따른 분기 메시지 */
export function AccessDenied({ characterStatus, className }: AccessDeniedProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 px-6",
        className,
      )}
    >
      {/* 자물쇠 아이콘 */}
      <div className="w-16 h-16 rounded-full border border-border bg-bg-secondary/80 flex items-center justify-center mb-6">
        <Lock className="w-7 h-7 text-accent" aria-label="접근 거부" />
      </div>

      {/* HELIOS SYSTEM 레이블 */}
      <span className="hud-label text-accent mb-2">HELIOS SYSTEM</span>

      {/* 메인 메시지 */}
      <h2 className="text-lg font-bold text-text mb-2">
        작전 참여 자격이 필요합니다
      </h2>

      {/* 상태별 안내 */}
      <StatusMessage characterStatus={characterStatus} />
    </div>
  );
}

/* ─── 상태별 메시지 분기 ─── */
function StatusMessage({
  characterStatus,
}: {
  characterStatus: "pending" | "rejected" | null;
}) {
  if (characterStatus === "pending") {
    return (
      <p className="text-sm text-text-secondary mt-2">
        승인 대기 중
      </p>
    );
  }

  if (characterStatus === "rejected") {
    return (
      <Link href="/character/create" className="mt-4">
        <Button variant="primary" size="sm">
          재신청
        </Button>
      </Link>
    );
  }

  /* characterStatus === null (미등록) */
  return (
    <Link href="/character/create" className="mt-4">
      <Button variant="primary" size="sm">
        캐릭터 생성하러 가기
      </Button>
    </Link>
  );
}
