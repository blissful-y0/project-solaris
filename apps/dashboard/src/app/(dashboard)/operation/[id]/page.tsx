"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { mockOperations } from "@/components/operation";
import { BattleSession, mockBattleSession } from "@/components/operation/session";
import type { TurnPhase, BattleSessionData } from "@/components/operation/session";
import { DowntimeRoom } from "@/components/room";
import {
  mockParticipants,
  mockRoomMessages,
} from "@/components/room/mock-room-data";

const phases: { value: TurnPhase; label: string }[] = [
  { value: "my_turn", label: "MY TURN" },
  { value: "waiting", label: "WAITING" },
  { value: "both_submitted", label: "SUBMITTED" },
  { value: "judging", label: "JUDGING" },
];

/**
 * 작전 세션 페이지 — /operation/[id]
 * mock 데이터에서 타입(operation/downtime)을 감지해
 * BattleSession 또는 DowntimeRoom을 렌더링한다.
 */
export default function OperationSessionPage() {
  const params = useParams();
  const router = useRouter();
  const operationId = params.id as string;

  /* mock 데이터에서 작전 찾기 */
  const operation = mockOperations.find((op) => op.id === operationId);

  /* 전투 세션 dev 페이즈 스위처 */
  const [phase, setPhase] = useState<TurnPhase>(mockBattleSession.phase);

  /* 작전을 찾지 못한 경우 */
  if (!operation) {
    return (
      <div className="py-12 text-center space-y-4">
        <p className="text-sm text-text-secondary">
          작전을 찾을 수 없습니다. (ID: {operationId})
        </p>
        <button
          type="button"
          onClick={() => router.push("/operation")}
          className="text-primary text-sm hover:underline"
        >
          ← 작전 목록으로
        </button>
      </div>
    );
  }

  /* ── DOWNTIME ── */
  if (operation.type === "downtime") {
    return (
      <div className="fixed top-22 bottom-16 left-0 right-0 md:bottom-0">
        <div className="w-full max-w-7xl mx-auto h-full">
          <DowntimeRoom
            roomTitle={operation.title}
            participants={mockParticipants}
            initialMessages={mockRoomMessages}
            currentUserId="p2"
          />
        </div>
      </div>
    );
  }

  /* ── OPERATION (전투) ── */
  const sessionData: BattleSessionData = {
    ...mockBattleSession,
    id: operation.id,
    title: operation.title,
    phase,
  };

  return (
    <div className="fixed top-22 bottom-16 left-0 right-0 md:bottom-0">
      <div className="w-full max-w-7xl mx-auto h-full relative">
        {/* dev: 페이즈 스위처 */}
        <div className="absolute top-0 right-0 z-50 flex gap-0.5 p-1 bg-bg-secondary/90 border-b border-l border-border rounded-bl-md">
          {phases.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPhase(p.value)}
              className={cn(
                "px-1.5 py-0.5 text-[0.5rem] font-mono rounded transition-colors",
                phase === p.value
                  ? "bg-primary/20 text-primary"
                  : "text-text-secondary hover:text-text hover:bg-bg-tertiary/60",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        <BattleSession key={phase} initialData={sessionData} className="!h-full" />
      </div>
    </div>
  );
}
