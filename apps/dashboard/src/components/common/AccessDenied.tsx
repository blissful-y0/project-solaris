import Link from "next/link";
import { ShieldOff } from "lucide-react";

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
        "flex flex-1 min-h-0 flex-col items-center justify-center text-center px-6",
        className,
      )}
    >
      {/* 아이콘 */}
      <div className="relative mb-8">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full border border-accent/30 bg-accent/5"
          style={{ boxShadow: "0 0 24px rgba(220, 38, 38, 0.15)" }}
        >
          <ShieldOff className="h-9 w-9 text-accent" aria-label="접근 거부" />
        </div>
      </div>

      {/* HELIOS SYSTEM 라벨 */}
      <span className="hud-label text-accent mb-4">HELIOS SYSTEM // ACCESS RESTRICTED</span>

      {/* 메인 메시지 */}
      <h2 className="text-xl font-bold text-text mb-2">
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
      <div className="mt-3 flex flex-col items-center gap-3">
        <p className="text-sm text-text-secondary">
          캐릭터가 승인 대기 중입니다.
          <br />
          관리자 승인 후 작전에 참여할 수 있습니다.
        </p>
        <span className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-warning">
          STATUS: PENDING REVIEW
        </span>
      </div>
    );
  }

  if (characterStatus === "rejected") {
    return (
      <div className="mt-3 flex flex-col items-center gap-4">
        <p className="text-sm text-text-secondary">
          캐릭터 등록이 반려되었습니다.
          <br />
          수정 후 다시 신청해 주세요.
        </p>
        <Link href="/character/create">
          <Button variant="primary" size="sm">
            재신청
          </Button>
        </Link>
      </div>
    );
  }

  /* characterStatus === null (미등록) */
  return (
    <div className="mt-3 flex flex-col items-center gap-4">
      <p className="text-sm text-text-secondary">
        등록된 캐릭터가 없습니다.
        <br />
        캐릭터를 생성하면 작전에 참여할 수 있습니다.
      </p>
      <Link href="/character/create">
        <Button variant="primary" size="sm">
          캐릭터 생성하러 가기
        </Button>
      </Link>
    </div>
  );
}
