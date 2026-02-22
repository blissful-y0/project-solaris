"use client";

import { useMemo } from "react";

import { cn } from "@/lib/utils";

import type { NarrativeRequest, RoomMessage, RoomParticipant } from "./types";

type NarrativeRequestCardProps = {
  request: NarrativeRequest;
  participants: RoomParticipant[];
  /** 전체 메시지 배열 — 범위 요약 표시용 */
  messages?: RoomMessage[];
};

/** 상태 표시 */
const statusConfig: Record<string, { label: string; color: string }> = {
  voting: { label: "관리자 검토 대기중", color: "text-amber-400" },
  approved: { label: "서사 반영 승인됨", color: "text-emerald-400" },
  rejected: { label: "서사 반영 반려됨", color: "text-accent" },
};

/** 텍스트를 maxLen 글자로 자르고 말줄임 */
function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + "...";
}

export function NarrativeRequestCard({
  request,
  participants,
  messages,
}: NarrativeRequestCardProps) {
  const requester = participants.find((p) => p.id === request.requesterId);
  const config = statusConfig[request.status] ?? statusConfig.voting;

  /* 범위 내 narration 메시지 추출 */
  const rangeMessages = useMemo(() => {
    if (!messages) return [];

    const narrations = messages.filter((m) => m.type === "narration");
    const startIdx = narrations.findIndex((m) => m.id === request.rangeStart);
    const endIdx = narrations.findIndex((m) => m.id === request.rangeEnd);
    if (startIdx === -1 || endIdx === -1) return [];

    const lo = Math.min(startIdx, endIdx);
    const hi = Math.max(startIdx, endIdx);
    return narrations.slice(lo, hi + 1);
  }, [messages, request.rangeStart, request.rangeEnd]);

  const firstMsg = rangeMessages[0];
  const lastMsg = rangeMessages.length > 1 ? rangeMessages[rangeMessages.length - 1] : null;

  return (
    <div
      data-testid="narrative-request-card"
      className="mx-auto max-w-md border border-dashed border-primary/30 rounded-lg bg-primary/5 p-4"
    >
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-primary">
          NARRATIVE REVIEW
        </span>
        {rangeMessages.length > 0 && (
          <span className="text-[0.625rem] text-text-secondary">
            {rangeMessages.length}건
          </span>
        )}
      </div>

      {/* 요청자 */}
      <p className="text-sm text-text-secondary mb-2">
        <span className="text-text font-medium">{requester?.name ?? "알 수 없음"}</span>
        이(가) 서사 반영을 요청했습니다.
      </p>

      {/* 범위 미리보기 */}
      {firstMsg && (
        <div
          data-testid="narrative-range-preview"
          className="text-xs text-text-secondary/80 bg-bg-tertiary/50 border border-border/30 rounded px-3 py-2 mb-3 space-y-1"
        >
          <p>
            <span className="text-text-secondary font-medium">{firstMsg.sender?.name}</span>
            {" "}
            {truncate(firstMsg.content, 40)}
          </p>
          {lastMsg && (
            <>
              <p className="text-text-secondary/50 text-center">···</p>
              <p>
                <span className="text-text-secondary font-medium">{lastMsg.sender?.name}</span>
                {" "}
                {truncate(lastMsg.content, 40)}
              </p>
            </>
          )}
        </div>
      )}

      {/* 상태 */}
      <div className="flex items-center justify-between">
        <span className={cn("text-xs font-medium", config.color)}>
          {config.label}
        </span>
      </div>
    </div>
  );
}
