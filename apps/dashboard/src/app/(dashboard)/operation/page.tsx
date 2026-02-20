"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { AccessDenied } from "@/components/common";
import { OperationHub } from "@/components/operation";
import type { OperationItem } from "@/components/operation";

type CharacterStatus = "approved" | "pending" | "rejected" | null;

export default function OperationPage() {
  /* TODO: 프로필 API 연동 후 실제 캐릭터 상태로 대체 */
  const [characterStatus, setCharacterStatus] = useState<CharacterStatus>(null);
  const [operations, setOperations] = useState<OperationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const isApproved = characterStatus === "approved";

  useEffect(() => {
    if (!isApproved) return;

    let mounted = true;
    setLoading(true);
    fetch("/api/operations", { method: "GET", cache: "no-store" })
      .then((response) => response.json())
      .then((body) => {
        if (!mounted) return;
        setOperations(body?.data ?? []);
      })
      .catch((error) => {
        console.error("[operation/page] 목록 조회 실패:", error);
        if (!mounted) return;
        setOperations([]);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isApproved]);

  return (
    <div className="py-6">
      {/* DEV: 승인 상태 토글 — 배포 전 제거 */}
      {process.env.NODE_ENV === "development" && (
        <div className="mb-6 flex gap-2">
          {(["미승인", "승인"] as const).map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => setCharacterStatus(i === 1 ? "approved" : null)}
              className={cn(
                "rounded border px-2 py-1 text-[0.625rem] transition-colors",
                (isApproved ? 1 : 0) === i
                  ? "border-primary text-primary"
                  : "border-border text-text-secondary hover:border-primary hover:text-primary",
              )}
            >
              [DEV] {label}
            </button>
          ))}
        </div>
      )}

      {isApproved ? (
        loading ? (
          <div className="text-sm text-text-secondary py-8">작전 목록을 불러오는 중...</div>
        ) : (
          <OperationHub operations={operations} />
        )
      ) : (
        <AccessDenied characterStatus={characterStatus} />
      )}
    </div>
  );
}
