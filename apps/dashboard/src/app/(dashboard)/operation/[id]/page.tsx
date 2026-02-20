"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { BattleSession, mockBattleSession } from "@/components/operation/session";
import type { TurnPhase, BattleSessionData } from "@/components/operation/session";
import { DowntimeRoom } from "@/components/room";
import type { RoomParticipant, RoomMessage } from "@/components/room/types";

const phases: { value: TurnPhase; label: string }[] = [
  { value: "my_turn", label: "MY TURN" },
  { value: "waiting", label: "WAITING" },
  { value: "both_submitted", label: "SUBMITTED" },
  { value: "judging", label: "JUDGING" },
];

/**
 * 작전 세션 페이지 — /operation/[id]
 * API에서 작전 타입(operation/downtime)을 로드해
 * BattleSession 또는 DowntimeRoom을 렌더링한다.
 */
export default function OperationSessionPage() {
  const params = useParams();
  const router = useRouter();
  const operationId = params.id as string;
  const isPhaseSwitcherEnabled =
    process.env.NEXT_PUBLIC_ENABLE_OPERATION_PHASE_SWITCHER === "true";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [operation, setOperation] = useState<{
    id: string;
    title: string;
    type: string;
    status: string;
    myParticipantId: string | null;
    participants: Array<{
      id: string;
      name: string;
      avatarUrl: string | null;
    }>;
    messages: RoomMessage[];
  } | null>(null);

  /* 전투 세션 dev 페이즈 스위처 */
  const [phase, setPhase] = useState<TurnPhase>(mockBattleSession.phase);

  const loadOperation = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/operations/${operationId}`, { cache: "no-store" });
      if (!res.ok) {
        setError("FAILED_TO_FETCH_OPERATION");
        return;
      }
      const body = await res.json();
      setOperation(body.data);
    } catch (e) {
      console.error("[operation/[id]] 상세 조회 실패:", e);
      setError("FAILED_TO_FETCH_OPERATION");
    } finally {
      setLoading(false);
    }
  }, [operationId]);

  useEffect(() => {
    void loadOperation();
  }, [loadOperation]);

  const participants: RoomParticipant[] = useMemo(
    () =>
      (operation?.participants ?? []).map((item) => ({
        id: item.id,
        name: item.name,
        avatarUrl: item.avatarUrl ?? undefined,
      })),
    [operation?.participants],
  );

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-text-secondary">
        작전 정보를 불러오는 중...
      </div>
    );
  }

  if (!operation || error) {
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
            participants={participants}
            initialMessages={operation.messages}
            currentUserId={operation.myParticipantId ?? ""}
          />
        </div>
      </div>
    );
  }

  /* ── OPERATION (전투) — 실연동은 task #9에서 진행 ── */
  const sessionData: BattleSessionData = {
    ...mockBattleSession,
    id: operation.id,
    title: operation.title,
    phase,
  };

  return (
    <div className="fixed top-22 bottom-16 left-0 right-0 md:bottom-0">
      <div className="w-full max-w-7xl mx-auto h-full relative">
        {/* QA/개발용 플래그: true일 때만 페이즈 강제 전환 UI 노출 */}
        {isPhaseSwitcherEnabled && (
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
        )}

        <BattleSession key={phase} initialData={sessionData} className="!h-full" />
      </div>
    </div>
  );
}
