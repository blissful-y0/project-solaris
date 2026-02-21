"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui";

import type { OperationItem } from "./types";

type MainStoryBannerProps = {
  event: OperationItem | null;
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
  const uniqueIds = new Set<string>();
  for (const member of [...item.teamA, ...item.teamB]) {
    if (member.id) uniqueIds.add(member.id);
  }
  return uniqueIds.size;
}

/** 운영자 MAIN STORY LIVE 배너 */
export function MainStoryBanner({ event }: MainStoryBannerProps) {
  const router = useRouter();
  const [joining, setJoining] = useState(false);

  const handleJoin = useCallback(async () => {
    if (!event || joining) return;
    setJoining(true);
    try {
      const response = await fetch(`/api/operations/${event.id}/join`, {
        method: "POST",
      });
      if (response.ok) {
        router.push(`/operation/${event.id}`);
      } else {
        const body = await response.json().catch(() => null);
        alert(body?.error ?? "JOIN_FAILED");
      }
    } finally {
      setJoining(false);
    }
  }, [event, joining, router]);

  if (!event) return null;

  return (
    <section
      data-testid="main-story-banner"
      className="hud-corners rounded-lg border border-primary/40 bg-primary/5 p-4 shadow-[0_0_20px_rgba(0,212,255,0.15)]"
    >
      {/* 라벨 */}
      <p className="hud-label mb-2 text-primary">
        MAIN STORY // ACTIVE
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
        <div className="flex gap-1.5">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/operation/${event.id}`)}>
            관전
          </Button>
          <Button variant="primary" size="sm" onClick={handleJoin} disabled={joining}>
            {joining ? "..." : "입장 ▸"}
          </Button>
        </div>
      </div>
    </section>
  );
}
