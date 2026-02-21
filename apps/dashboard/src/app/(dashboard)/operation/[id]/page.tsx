"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { BattleSession } from "@/components/operation/session";
import type { BattleAbility, BattleParticipant, ChatMessage, Faction, TurnPhase, BattleSessionData } from "@/components/operation/session";
import { DowntimeRoom } from "@/components/room";
import type { RoomMessage, RoomParticipant } from "@/components/room/types";
import { createClient } from "@/lib/supabase/client";

const phases: { value: TurnPhase; label: string }[] = [
  { value: "my_turn", label: "MY TURN" },
  { value: "waiting", label: "WAITING" },
  { value: "both_submitted", label: "SUBMITTED" },
  { value: "judging", label: "JUDGING" },
];

const FACTION_DEFAULT_STATS: Record<"bureau" | "static" | "defector", { hp: number; will: number }> = {
  bureau: { hp: 80, will: 250 },
  static: { hp: 120, will: 150 },
  defector: { hp: 100, will: 200 },
};

/** API 응답 참가자 타입 */
type ApiParticipant = {
  id: string;
  name: string;
  faction?: string | null;
  team: "bureau" | "static" | "defector";
  hp?: { current: number; max: number } | null;
  will?: { current: number; max: number } | null;
  avatarUrl?: string | null;
  abilities: Array<{
    id: string;
    name: string;
    tier: string;
    costHp: number;
    costWill: number;
  }>;
};

/** API 응답 메시지 타입 (mapOperationMessage 출력) */
type ApiMessage = {
  id: string;
  type: string;
  senderId?: string | null;
  senderName?: string | null;
  senderAvatarUrl?: string | null;
  content: string;
  timestamp: string;
  isMine?: boolean;
};

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
    participants: ApiParticipant[];
    messages: ApiMessage[];
  } | null>(null);

  /* 전투 세션 dev 페이즈 스위처 */
  const [phase, setPhase] = useState<TurnPhase>("my_turn");

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

  /* 참가자 변경 Realtime 동기화 */
  useEffect(() => {
    if (!operationId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`operation_participants:${operationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "operation_participants",
          filter: `operation_id=eq.${operationId}`,
        },
        () => {
          void loadOperation();
        },
      )
      .subscribe();

    return () => {
      void channel.unsubscribe();
    };
  }, [operationId, loadOperation]);

  /* Downtime용 RoomParticipant 목록 */
  const roomParticipants: RoomParticipant[] = useMemo(
    () =>
      (operation?.participants ?? []).map((item) => ({
        id: item.id,
        name: item.name,
        avatarUrl: item.avatarUrl ?? undefined,
      })),
    [operation?.participants],
  );

  /* Downtime용 RoomMessage 목록 */
  const roomMessages: RoomMessage[] = useMemo(
    () =>
      (operation?.messages ?? []).map((m) => ({
        id: m.id,
        type: (m.type ?? "narration") as RoomMessage["type"],
        sender: m.senderId
          ? { id: m.senderId, name: m.senderName ?? "Unknown", avatarUrl: m.senderAvatarUrl ?? undefined }
          : undefined,
        content: m.content,
        timestamp: m.timestamp,
        isMine: m.isMine,
      })),
    [operation?.messages],
  );

  /* 전투용 BattleParticipant 목록 */
  const battleParticipants: BattleParticipant[] = useMemo(
    () =>
      (operation?.participants ?? []).map((item) => {
        const faction = (item.faction ?? item.team) as Faction;
        const defaults = FACTION_DEFAULT_STATS[item.team];
        return {
          id: item.id,
          name: item.name,
          faction,
          team: (item.team === "bureau" ? "ally" : "enemy") as "ally" | "enemy",
          hp: item.hp ?? { current: defaults.hp, max: defaults.hp },
          will: item.will ?? { current: defaults.will, max: defaults.will },
          abilities: item.abilities.map((a) => ({
            id: a.id,
            name: a.name,
            tier: a.tier as BattleAbility["tier"],
            costHp: a.costHp,
            costWill: a.costWill,
          })),
        };
      }),
    [operation?.participants],
  );

  /* 전투용 ChatMessage 목록 */
  const battleMessages: ChatMessage[] = useMemo(
    () =>
      (operation?.messages ?? []).map((m) => ({
        id: m.id,
        type: (m.type ?? "narration") as ChatMessage["type"],
        senderId: m.senderId ?? undefined,
        senderName: m.senderName ?? undefined,
        senderAvatarUrl: m.senderAvatarUrl ?? undefined,
        content: m.content,
        timestamp: m.timestamp,
        isMine: m.isMine,
      })),
    [operation?.messages],
  );

  /**
   * 전투 서술 제출 — 로컬 낙관적 업데이트 후 API에 저장
   * (phase 1: encounter 없이 operation_messages 테이블에 직접 저장)
   */
  const handleBattleAction = useCallback(
    async (narration: string) => {
      try {
        await fetch(`/api/operations/${operationId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: narration }),
        });
      } catch (e) {
        console.error("[operation/[id]] 서술 저장 실패:", e);
      }
    },
    [operationId],
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
            operationId={operation.id}
            isParticipant={Boolean(operation.myParticipantId)}
            roomTitle={operation.title}
            participants={roomParticipants}
            initialMessages={roomMessages}
            currentUserId={operation.myParticipantId ?? ""}
          />
        </div>
      </div>
    );
  }

  /* ── OPERATION (전투) — 실 참가자/메시지 연동 ── */
  const sessionData: BattleSessionData = {
    id: operation.id,
    title: operation.title,
    currentTurn: 1,
    phase,
    participants: battleParticipants,
    messages: battleMessages,
    myParticipantId: operation.myParticipantId ?? "",
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

        <BattleSession
          key={phase}
          initialData={sessionData}
          onAction={handleBattleAction}
          className="!h-full"
        />
      </div>
    </div>
  );
}
