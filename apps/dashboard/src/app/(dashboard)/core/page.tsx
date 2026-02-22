"use client";

export const dynamic = "force-dynamic";

import { AccessDenied } from "@/components/common";
import {
  CoreHighlights,
  CoreNoticeBoard,
  CoreSystemStatus,
  CoreTimeline,
} from "@/components/core";
import {
  BATTLE_HIGHLIGHTS,
  CORE_NOTICES,
  CORE_TIMELINE,
  SYSTEM_STATUS,
} from "@/components/core/mock-core-data";
import { useDashboardSession } from "@/components/layout/DashboardSessionProvider";

export default function CorePage() {
  const { me, loading } = useDashboardSession();
  const characterStatus = me?.character?.status ?? null;

  if (loading) {
    return <div className="pb-6" />;
  }

  if (characterStatus !== "approved") {
    return (
      <div className="flex min-h-[calc(100dvh-10rem)]">
        <AccessDenied characterStatus={characterStatus} />
      </div>
    );
  }

  return (
    <section className="pb-6 space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <p className="hud-label">HELIOS CORE // COMMAND CENTER</p>
      </div>

      {/* 모바일: SystemStatus 상단 요약 */}
      <div data-testid="mobile-system-status" className="lg:hidden">
        <CoreSystemStatus data={SYSTEM_STATUS} />
      </div>

      {/* 데스크탑 3열: 타임라인(2col) + 사이드(1col) */}
      <div className="lg:grid lg:grid-cols-3 lg:gap-6">
        {/* 좌측: 타임라인 */}
        <div className="lg:col-span-2">
          <CoreTimeline items={CORE_TIMELINE} />
        </div>

        {/* 우측: 공지 + 시스템 상태 + 하이라이트 */}
        <div className="mt-4 space-y-4 lg:col-span-1 lg:mt-0">
          <CoreNoticeBoard items={CORE_NOTICES} />
          <div className="hidden lg:block">
            <CoreSystemStatus data={SYSTEM_STATUS} />
          </div>
          <CoreHighlights items={BATTLE_HIGHLIGHTS} />
        </div>
      </div>
    </section>
  );
}
