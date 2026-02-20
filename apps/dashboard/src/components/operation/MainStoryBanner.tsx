import { Button } from "@/components/ui";

import type { OperationItem } from "./types";

type MainStoryBannerProps = {
  event: OperationItem | null;
  onJoin?: (event: OperationItem) => void;
};

/** 개설일 포맷 (YYYY.MM.DD) */
function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

/** 참가자 총 인원 */
function participantCount(item: OperationItem): number {
  return item.teamA.length + item.teamB.length;
}

/** 운영자 MAIN STORY LIVE 배너 */
export function MainStoryBanner({ event, onJoin }: MainStoryBannerProps) {
  if (!event) return null;

  return (
    <section
      data-testid="main-story-banner"
      className="hud-corners rounded-lg border border-primary/40 bg-primary/5 p-4 shadow-[0_0_20px_rgba(0,212,255,0.15)]"
    >
      {/* 라벨 */}
      <p className="hud-label mb-2 text-primary">
        ⚡ MAIN STORY // ACTIVE
      </p>

      {/* 제목 */}
      <h2 className="mb-1 text-lg font-bold text-text">{event.title}</h2>

      {/* 설명 */}
      <p className="mb-3 text-sm text-text-secondary">{event.summary}</p>

      {/* 메타 + CTA */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-secondary">
          참가자 {participantCount(event)}/{event.maxParticipants}
          <span className="mx-1.5 text-text-secondary/40">·</span>
          {formatDate(event.createdAt)} 개설
        </p>
        <Button variant="primary" size="sm" onClick={() => onJoin?.(event)}>
          작전 참가 ▸
        </Button>
      </div>
    </section>
  );
}
