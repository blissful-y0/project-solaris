"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";

import type { RoomMessage, RoomParticipant } from "./types";
import { RoomChatLog } from "./RoomChatLog";
import { useRoomMessages } from "./use-room-messages";

type DowntimeRoomProps = {
  operationId: string;
  isParticipant: boolean;
  roomTitle: string;
  participants: RoomParticipant[];
  initialMessages: RoomMessage[];
  currentUserId: string;
  className?: string;
};

export function DowntimeRoom({
  operationId,
  isParticipant,
  roomTitle,
  participants,
  initialMessages,
  currentUserId,
  className,
}: DowntimeRoomProps) {
  const router = useRouter();
  const [inputText, setInputText] = useState("");

  const { messages, upsertMessage } = useRoomMessages(
    operationId,
    initialMessages,
    participants,
    currentUserId,
  );

  /* ── 서사 반영 범위 선택 상태 ── */
  const [selectingRange, setSelectingRange] = useState(false);
  const [selectedRange, setSelectedRange] = useState<{
    start: string;
    end?: string;
  } | null>(null);

  // 메시지 전송 — API 응답으로 즉시 반영하고, Realtime은 다른 클라이언트 동기화에 사용한다.
  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text) return;

    const currentUser = participants.find((p) => p.id === currentUserId);
    setInputText("");

    try {
      const response = await fetch(`/api/operations/${operationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });

      if (response.ok) {
        const body = await response.json();
        const sent = body?.data;

        if (sent?.id) {
          const sender: RoomParticipant | undefined =
            sent.senderId
              ? {
                  id: sent.senderId,
                  name: sent.senderName ?? currentUser?.name ?? "알 수 없음",
                  avatarUrl: sent.senderAvatarUrl ?? currentUser?.avatarUrl,
                }
              : currentUser;

          upsertMessage({
            id: sent.id,
            type: "narration",
            sender,
            content: sent.content ?? text,
            timestamp: sent.timestamp ?? new Date().toISOString(),
            isMine: true,
          });
          return;
        }
      }
      return;
    } catch (e) {
      console.error("[DowntimeRoom] 메시지 전송 실패:", e);
    }

    // 응답 파싱 실패/네트워크 오류시 최소한 로컬에 표시해 UX 지연을 줄인다.
    upsertMessage({
      id: `msg-${Date.now()}`,
      type: "narration",
      sender: currentUser,
      content: text,
      timestamp: new Date().toISOString(),
      isMine: true,
    });
  }, [inputText, operationId, participants, currentUserId, upsertMessage]);

  // Enter 키로 전송 (Shift+Enter = 줄바꿈)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // IME 조합 중 Enter는 전송 키가 아니라 조합 확정 키다.
      if (e.nativeEvent.isComposing || (e as unknown as { keyCode?: number }).keyCode === 229) {
        return;
      }

      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        void handleSend();
      }
    },
    [handleSend],
  );

  // 입력값만 갱신한다. 자동 높이 조절은 타이핑 중 레이아웃 재계산으로 버벅임을 유발한다.
  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInputText(e.target.value);
    },
    [],
  );

  /* ── 서사 반영: 범위 선택 시작 ── */
  const handleStartSelection = useCallback(() => {
    setSelectingRange(true);
    setSelectedRange(null);
  }, []);

  /* ── 서사 반영: 범위 선택 취소 ── */
  const handleCancelSelection = useCallback(() => {
    setSelectingRange(false);
    setSelectedRange(null);
  }, []);

  /* ── 서사 반영: 메시지 클릭으로 범위 선택 ── */
  const handleMessageSelect = useCallback(
    (messageId: string) => {
      if (!selectingRange) return;

      if (!selectedRange?.start) {
        setSelectedRange({ start: messageId });
      } else if (!selectedRange.end) {
        setSelectedRange({ start: selectedRange.start, end: messageId });
      } else {
        setSelectedRange({ start: messageId });
      }
    },
    [selectingRange, selectedRange],
  );

  /* ── 서사 반영: 요청 확정 (로컬 메시지로 추가) ── */
  const handleConfirmRequest = useCallback(() => {
    if (!selectedRange?.start || !selectedRange.end) return;

    const currentUser = participants.find((p) => p.id === currentUserId);

    const requestMessage: RoomMessage = {
      id: `msg-${Date.now()}`,
      type: "narrative_request",
      sender: currentUser,
      content: `${currentUser?.name}이(가) 서사 반영을 요청했습니다.`,
      timestamp: new Date().toISOString(),
      isMine: false,
      narrativeRequest: {
        id: `nr-${Date.now()}`,
        requesterId: currentUserId,
        rangeStart: selectedRange.start,
        rangeEnd: selectedRange.end ?? selectedRange.start,
        status: "voting",
        votes: {},
        totalParticipants: participants.length,
      },
    };

    upsertMessage(requestMessage);
    setSelectingRange(false);
    setSelectedRange(null);
  }, [selectedRange, participants, currentUserId, upsertMessage]);

  const rangeComplete = selectedRange?.start && selectedRange?.end;

  return (
    <div className={cn("flex flex-col h-full bg-bg", className)}>
      {/* 상단 바 */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-bg-secondary/80 backdrop-blur-sm">
        <button
          aria-label="뒤로가기"
          onClick={() => router.back()}
          className="text-text-secondary hover:text-text transition-colors"
          data-testid="back-button"
        >
          ←
        </button>
        <h1 className="flex-1 text-sm font-semibold text-text truncate">
          {roomTitle}
        </h1>
        <span
          className="text-xs text-text-secondary"
          data-testid="participant-count"
        >
          {participants.length}명
        </span>
        {isParticipant && (
          <button
            onClick={selectingRange ? handleCancelSelection : handleStartSelection}
            className={cn(
              "text-[0.65rem] font-medium transition-colors",
              selectingRange
                ? "text-accent/80 hover:text-accent"
                : "text-primary/70 hover:text-primary",
            )}
            data-testid={selectingRange ? "cancel-selection-btn" : "narrative-request-btn"}
          >
            {selectingRange ? "취소" : "서사반영"}
          </button>
        )}
        <button
          aria-label="메뉴"
          className="text-text-secondary hover:text-text transition-colors"
          data-testid="menu-button"
        >
          ⋯
        </button>
      </header>

      {/* 채팅 로그 */}
      <RoomChatLog
        messages={messages}
        participants={participants}
        currentUserId={currentUserId}
        selectingRange={selectingRange}
        selectedRange={selectedRange ?? undefined}
        onMessageSelect={handleMessageSelect}
      />

      {/* ── 범위 선택 모드: 하단 바 ── */}
      {isParticipant && selectingRange && (
        <div className="border-t border-primary/30 bg-bg-secondary/90 backdrop-blur-sm px-4 py-3 flex items-center gap-3">
          <span className="flex-1 text-xs text-text-secondary">
            {rangeComplete
              ? "선택 완료 — 요청을 전송하세요"
              : "메시지를 선택하세요"}
          </span>
          <Button
            variant="primary"
            size="sm"
            disabled={!rangeComplete}
            onClick={handleConfirmRequest}
            data-testid="confirm-request-btn"
          >
            요청 전송
          </Button>
        </div>
      )}

      {/* ── 일반 입력 영역 (범위 선택 중이면 숨김) ── */}
      {!selectingRange && isParticipant && (
        <div className="border-t border-border bg-bg-secondary/80 backdrop-blur-sm p-3">
          <div className="flex items-end gap-2">
            <textarea
              value={inputText}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="서술을 입력하세요..."
              rows={3}
              data-testid="chat-input"
              className={cn(
                "flex-1 resize-none overflow-y-auto rounded-lg bg-bg-tertiary border border-border px-3 py-2",
                "text-sm text-text placeholder:text-text-secondary/50",
                "focus:outline-none focus:border-primary/40 transition-colors",
                "h-[96px]",
              )}
            />
            <Button
              variant="primary"
              size="sm"
              onClick={() => void handleSend()}
              disabled={!inputText.trim()}
              data-testid="send-button"
              className="shrink-0 mb-0.5"
            >
              ▶
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
