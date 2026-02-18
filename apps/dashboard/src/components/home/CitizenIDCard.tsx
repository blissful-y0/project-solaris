"use client";

import { cn } from "@/lib/utils";
import type { CitizenData } from "./mock-citizen";
import { RegisteredCard, EmptyCard, PendingCard, RejectedCard } from "./CardVariants";

/* ─── 메인 라우터 컴포넌트 ─── */
type CitizenIDCardProps = {
  citizen: CitizenData | null;
  className?: string;
  onCancel?: () => void;
  onAvatarChange?: (url: string) => void;
};

export function CitizenIDCard({ citizen, className, onCancel, onAvatarChange }: CitizenIDCardProps) {
  if (!citizen) {
    return (
      <div className={cn("w-full", className)}>
        <EmptyCard />
      </div>
    );
  }

  const status = citizen.status ?? "approved";

  if (status === "pending") {
    return (
      <div className={cn("w-full", className)}>
        <PendingCard citizen={citizen} onCancel={onCancel} />
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className={cn("w-full", className)}>
        <RejectedCard citizen={citizen} />
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <RegisteredCard citizen={citizen} onAvatarChange={onAvatarChange} />
    </div>
  );
}
