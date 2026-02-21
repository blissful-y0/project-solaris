"use client";

import { useEffect, useRef, useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/format-time";
import { Avatar } from "@/components/ui";

import type { RoomMessage, RoomParticipant } from "./types";
import { NarrativeRequestCard } from "./NarrativeRequestCard";

type RoomChatLogProps = {
  messages: RoomMessage[];
  participants: RoomParticipant[];
  currentUserId: string;
  /** 범위 선택 모드 활성화 */
  selectingRange?: boolean;
  /** 선택된 메시지 ID (시작, 끝) */
  selectedRange?: { start: string; end?: string };
  /** 메시지 클릭 시 호출 */
  onMessageSelect?: (messageId: string) => void;
};

const CHAT_MESSAGE_INLINE_LIMIT = 2000;

function NarrationContent({ content }: { content: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = content.length > CHAT_MESSAGE_INLINE_LIMIT;
  const displayContent = !isLong || expanded
    ? content
    : `${content.slice(0, CHAT_MESSAGE_INLINE_LIMIT)}...`;

  return (
    <div className="space-y-2">
      <p className="text-[0.9375rem] leading-relaxed text-text whitespace-pre-wrap">
        {displayContent}
      </p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="text-xs text-primary hover:underline"
          aria-label={expanded ? "메시지 접기" : "메시지 더보기"}
        >
          {expanded ? "접기" : "더보기"}
        </button>
      )}
    </div>
  );
}

/** 내 서술 (우측 말풍선) */
function MyNarration({
  message,
  selectable,
  highlighted,
  onSelect,
}: {
  message: RoomMessage;
  selectable?: boolean;
  highlighted?: boolean;
  onSelect?: () => void;
}) {
  return (
    <div
      className={cn("flex justify-end gap-2", selectable && "cursor-pointer")}
      data-testid={`message-${message.id}`}
      onClick={selectable ? onSelect : undefined}
    >
      <div className="flex flex-col items-end max-w-[75%]">
        <div
          className={cn(
            "rounded-lg bg-primary/10 border px-4 py-3 transition-colors",
            highlighted
              ? "border-primary bg-primary/20 ring-1 ring-primary/40"
              : "border-primary/20",
            selectable && !highlighted && "hover:border-primary/50",
          )}
        >
          <NarrationContent content={message.content} />
        </div>
        <time className="text-[0.6rem] text-text-secondary mt-1 px-1">
          {formatTime(message.timestamp)}
        </time>
      </div>
      <Avatar
        src={message.sender?.avatarUrl}
        name={message.sender?.name}
      />
    </div>
  );
}

/** 타인 서술 (좌측 말풍선 + 이름 헤더) */
function OtherNarration({
  message,
  selectable,
  highlighted,
  onSelect,
}: {
  message: RoomMessage;
  selectable?: boolean;
  highlighted?: boolean;
  onSelect?: () => void;
}) {
  return (
    <div
      className={cn("flex justify-start gap-2", selectable && "cursor-pointer")}
      data-testid={`message-${message.id}`}
      onClick={selectable ? onSelect : undefined}
    >
      <Avatar
        src={message.sender?.avatarUrl}
        name={message.sender?.name}
      />
      <div className="flex flex-col items-start max-w-[75%]">
        <p className="text-xs text-primary font-medium mb-1">
          {message.sender?.name}
        </p>
        <div
          className={cn(
            "rounded-lg bg-bg-tertiary border px-4 py-3 transition-colors",
            highlighted
              ? "border-primary bg-primary/10 ring-1 ring-primary/40"
              : "border-border",
            selectable && !highlighted && "hover:border-primary/50",
          )}
        >
          <NarrationContent content={message.content} />
        </div>
        <time className="text-[0.6rem] text-text-secondary mt-1 px-1">
          {formatTime(message.timestamp)}
        </time>
      </div>
    </div>
  );
}

/** 시스템 메시지 (중앙) */
function SystemMessage({ message }: { message: RoomMessage }) {
  return (
    <div
      className="flex justify-center"
      data-testid={`message-${message.id}`}
    >
      <p className="text-xs text-text-secondary bg-bg-tertiary/50 border border-border/50 rounded-full px-4 py-1.5">
        {message.content}
      </p>
    </div>
  );
}

export function RoomChatLog({
  messages,
  participants,
  currentUserId,
  selectingRange,
  selectedRange,
  onMessageSelect,
}: RoomChatLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // 새 메시지 시 자동 스크롤
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  /* 선택 범위 안에 있는 메시지 ID 집합 */
  const highlightedIds = useMemo(() => {
    if (!selectedRange?.start) return new Set<string>();
    if (!selectedRange.end) return new Set([selectedRange.start]);

    const narrationIds = messages
      .filter((m) => m.type === "narration")
      .map((m) => m.id);

    const startIdx = narrationIds.indexOf(selectedRange.start);
    const endIdx = narrationIds.indexOf(selectedRange.end);
    if (startIdx === -1 || endIdx === -1) return new Set<string>();

    const lo = Math.min(startIdx, endIdx);
    const hi = Math.max(startIdx, endIdx);
    return new Set(narrationIds.slice(lo, hi + 1));
  }, [messages, selectedRange]);

  return (
    <div
      ref={scrollRef}
      data-testid="room-chat-log"
      className={cn("flex-1 overflow-y-auto px-4 py-3 space-y-4")}
    >
      {/* 범위 선택 안내 */}
      {selectingRange && (
        <div className="sticky top-0 z-10 flex justify-center">
          <span className="text-[0.65rem] text-primary bg-primary/10 border border-primary/30 rounded-full px-3 py-1 backdrop-blur-sm">
            {!selectedRange?.start
              ? "서사 반영할 시작 메시지를 선택하세요"
              : !selectedRange.end
                ? "끝 메시지를 선택하세요"
                : "범위가 선택되었습니다"}
          </span>
        </div>
      )}

      {messages.map((message) => {
        const isNarration = message.type === "narration";
        const selectable = selectingRange && isNarration;
        const highlighted = highlightedIds.has(message.id);

        switch (message.type) {
          case "narration":
            return message.isMine ? (
              <MyNarration
                key={message.id}
                message={message}
                selectable={selectable}
                highlighted={highlighted}
                onSelect={() => onMessageSelect?.(message.id)}
              />
            ) : (
              <OtherNarration
                key={message.id}
                message={message}
                selectable={selectable}
                highlighted={highlighted}
                onSelect={() => onMessageSelect?.(message.id)}
              />
            );

          case "system":
            return <SystemMessage key={message.id} message={message} />;

          case "narrative_request":
            return message.narrativeRequest ? (
              <NarrativeRequestCard
                key={message.id}
                request={message.narrativeRequest}
                participants={participants}
                messages={messages}
              />
            ) : null;

          default:
            return null;
        }
      })}
    </div>
  );
}
