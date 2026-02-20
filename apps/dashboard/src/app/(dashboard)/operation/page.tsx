"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import { AccessDenied } from "@/components/common";
import { OperationHub, mockOperations } from "@/components/operation";

export default function OperationPage() {
  /* DEV 모드: 0=미승인, 1=승인 */
  const [isApproved, setIsApproved] = useState(true);

  return (
    <div className="py-6">
      {/* DEV: 승인 상태 토글 — 배포 전 제거 */}
      {process.env.NODE_ENV === "development" && (
        <div className="mb-6 flex gap-2">
          {(["미승인", "승인"] as const).map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => setIsApproved(i === 1)}
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
        <OperationHub operations={mockOperations} />
      ) : (
        <AccessDenied characterStatus={null} />
      )}
    </div>
  );
}
