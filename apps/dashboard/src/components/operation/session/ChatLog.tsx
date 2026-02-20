"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/format-time";
import { Avatar, Badge } from "@/components/ui";
import type { ChatMessage } from "./types";
import { JudgmentCard } from "./JudgmentCard";

/* ── 행동 타입 라벨 ── */
const actionLabels: Record<string, { label: string; variant: "info" | "danger" | "success" | "warning" }> = {
  attack: { label: "공격", variant: "danger" },
  defend: { label: "방어", variant: "info" },
  support: { label: "지원", variant: "success" },
};

/* ── 서술 말풍선 ── */
function NarrationBubble({ message }: { message: ChatMessage }) {
  const isMine = message.isMine;
  const action = message.action;
  const actionInfo = action ? actionLabels[action.actionType] : null;

  return (
    <div
      data-testid="narration-bubble"
      className={cn("flex gap-2", isMine ? "justify-end" : "justify-start")}
    >
      {/* 아바타 (상대만 좌측) */}
      {!isMine && (
        <Avatar src={message.senderAvatarUrl} name={message.senderName} />
      )}

      <div className={cn("flex flex-col max-w-[75%]", isMine ? "items-end" : "items-start")}>
        {/* 발신자 이름 (상대 서술만) */}
        {!isMine && message.senderName && (
          <span className="text-xs text-primary font-medium mb-1">{message.senderName}</span>
        )}

        {/* 행동 뱃지 */}
        {actionInfo && (
          <div className="flex items-center gap-1.5 mb-1 px-1">
            <Badge variant={actionInfo.variant} size="sm">{actionInfo.label}</Badge>
            <span className="text-[0.6rem] text-text-secondary">
              {action!.abilityName} → {action!.targetName}
            </span>
          </div>
        )}

        {/* 서술 본문 */}
        <div
          className={cn(
            "rounded-lg px-4 py-3 text-[0.9375rem] leading-relaxed whitespace-pre-wrap",
            isMine
              ? "bg-primary/10 border border-primary/20 text-text"
              : "bg-bg-tertiary border border-border text-text",
          )}
        >
          {message.content}
        </div>

        {/* 타임스탬프 */}
        <span className="text-[0.6rem] text-text-secondary mt-1 px-1">
          {formatTime(message.timestamp)}
        </span>
      </div>

      {/* 아바타 (내 서술 우측) */}
      {isMine && (
        <Avatar src={message.senderAvatarUrl} name={message.senderName} />
      )}
    </div>
  );
}

/* ── GM 서사 버블 (중앙 배치, 릴레이 소설 느낌) ── */
function GmNarrationBubble({ message }: { message: ChatMessage }) {
  return (
    <div data-testid="gm-narration-bubble" className="flex justify-center">
      <div
        className={cn(
          "w-full rounded-lg px-4 py-3",
          "bg-primary/5 border border-primary/20",
          "text-sm text-text leading-relaxed italic whitespace-pre-wrap",
        )}
      >
        {message.content}
      </div>
    </div>
  );
}

/* ── 시스템 메시지 ── */
function SystemMessage({ message }: { message: ChatMessage }) {
  return (
    <div data-testid="system-message" className="flex justify-center">
      <div className="text-[0.65rem] text-text-secondary bg-subtle/30 border border-border rounded-full px-3 py-1">
        {message.content}
      </div>
    </div>
  );
}

/* ── 메인 ChatLog 컴포넌트 ── */
type ChatLogProps = {
  messages: ChatMessage[];
  className?: string;
};

export function ChatLog({ messages, className }: ChatLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  /* 새 메시지 추가 시 자동 스크롤 */
  useEffect(() => {
    if (typeof bottomRef.current?.scrollIntoView === "function") {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  return (
    <div
      data-testid="chat-log"
      className={cn("flex-1 overflow-y-auto px-4 py-3 space-y-4", className)}
    >
      {messages.map((msg) => {
        switch (msg.type) {
          case "narration":
            return <NarrationBubble key={msg.id} message={msg} />;
          case "judgment":
            return msg.judgment ? (
              <JudgmentCard key={msg.id} judgment={msg.judgment} />
            ) : null;
          case "gm_narration":
            return <GmNarrationBubble key={msg.id} message={msg} />;
          case "system":
            return <SystemMessage key={msg.id} message={msg} />;
          default:
            return null;
        }
      })}
      <div ref={bottomRef} />
    </div>
  );
}
