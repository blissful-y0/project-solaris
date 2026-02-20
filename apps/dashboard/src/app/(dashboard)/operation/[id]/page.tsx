"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui";
import { DowntimeRoom } from "@/components/room";
import type { RoomMessage, RoomParticipant } from "@/components/room";

type OperationDetailResponse = {
  data: {
    id: string;
    title: string;
    type: "operation" | "downtime";
    status: "waiting" | "live" | "completed";
    summary: string;
    myParticipantId: string | null;
    participants: Array<{
      id: string;
      name: string;
      avatarUrl?: string | null;
    }>;
    messages: Array<{
      id: string;
      type: "narration" | "system" | "narrative_request";
      senderId: string | null;
      senderName: string | null;
      senderAvatarUrl: string | null;
      content: string;
      timestamp: string;
      isMine: boolean;
    }>;
  };
};

/**
 * 작전 세션 페이지 — /operation/[id]
 * 실제 API(`/api/operations/[id]`) 데이터를 사용해 방을 렌더링한다.
 */
export default function OperationSessionPage() {
  const params = useParams();
  const router = useRouter();
  const operationId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [joinLoading, setJoinLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [operation, setOperation] = useState<OperationDetailResponse["data"] | null>(null);

  const loadOperation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/operations/${operationId}`, {
        method: "GET",
        cache: "no-store",
      });
      const body = await response.json();

      if (!response.ok) {
        setOperation(null);
        setError(body?.error ?? "FAILED_TO_FETCH_OPERATION");
        return;
      }

      setOperation(body.data);
    } catch (e) {
      console.error("[operation/[id]] 상세 조회 실패:", e);
      setOperation(null);
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

  const messages: RoomMessage[] = useMemo(() => {
    return (operation?.messages ?? []).map((message) => {
      const senderFromParticipants = participants.find((item) => item.id === message.senderId);
      const sender =
        senderFromParticipants ??
        (message.senderId
          ? {
              id: message.senderId,
              name: message.senderName ?? "알 수 없음",
              avatarUrl: message.senderAvatarUrl ?? undefined,
            }
          : undefined);

      return {
        id: message.id,
        type: message.type,
        sender,
        content: message.content,
        timestamp: message.timestamp,
        isMine: message.isMine,
      } as RoomMessage;
    });
  }, [operation?.messages, participants]);

  const isJoined = useMemo(() => {
    if (!operation?.myParticipantId) return false;
    return participants.some((participant) => participant.id === operation.myParticipantId);
  }, [operation?.myParticipantId, participants]);

  const handleJoin = useCallback(async () => {
    if (!operationId) return;
    setJoinLoading(true);
    try {
      const response = await fetch(`/api/operations/${operationId}/join`, {
        method: "POST",
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        alert(body?.error ?? "JOIN_FAILED");
        return;
      }
      await loadOperation();
    } finally {
      setJoinLoading(false);
    }
  }, [operationId, loadOperation]);

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
          {error ? ` / error: ${error}` : ""}
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
          {!isJoined && (
            <div className="mx-4 mb-2 rounded-lg border border-primary/30 bg-primary/5 p-3 text-xs text-text-secondary">
              <div className="mb-2">
                현재 이 방 참가자로 등록되어 있지 않습니다. 참가 후 메시지 반영/참가자 목록이 정상화됩니다.
              </div>
              <Button
                variant="primary"
                size="sm"
                disabled={joinLoading}
                onClick={handleJoin}
              >
                {joinLoading ? "참가 처리 중..." : "방 참가하기"}
              </Button>
            </div>
          )}
          <DowntimeRoom
            roomTitle={operation.title}
            operationId={operation.id}
            participants={participants}
            initialMessages={messages}
            currentUserId={operation.myParticipantId ?? ""}
          />
        </div>
      </div>
    );
  }

  /* ── OPERATION (전투) ── */
  return (
    <div className="py-12 text-center space-y-3">
      <p className="text-sm text-text-secondary">전투 세션(operation) 실연동은 다음 단계에서 구현됩니다.</p>
      <div>
        <button
          type="button"
          onClick={() => router.push("/operation")}
          className="text-primary text-sm hover:underline"
        >
          ← 작전 목록으로
        </button>
      </div>
    </div>
  );
}
