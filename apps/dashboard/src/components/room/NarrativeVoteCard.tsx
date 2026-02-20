"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";

import type { NarrativeRequest, RoomParticipant } from "./types";

type NarrativeVoteCardProps = {
  request: NarrativeRequest;
  participants: RoomParticipant[];
  currentUserId: string;
  onVote: (vote: "reflect" | "skip") => void;
};

/** 투표 상태 아이콘 */
function voteIcon(status: string): string {
  switch (status) {
    case "reflect":
      return "✔";
    case "skip":
      return "✖";
    default:
      return "⏳";
  }
}

/** 투표 상태 색상 */
function voteColor(status: string): string {
  switch (status) {
    case "reflect":
      return "text-emerald-400";
    case "skip":
      return "text-accent";
    default:
      return "text-text-secondary";
  }
}

/** 투표 상태 라벨 */
function voteLabel(status: string): string {
  switch (status) {
    case "reflect":
      return "반영";
    case "skip":
      return "미반영";
    default:
      return "대기중";
  }
}

export function NarrativeVoteCard({
  request,
  participants,
  currentUserId,
  onVote,
}: NarrativeVoteCardProps) {
  const requester = participants.find((p) => p.id === request.requesterId);
  const myVote = request.votes[currentUserId];
  const hasVoted = myVote === "reflect" || myVote === "skip";

  // 투표 집계
  const reflectCount = Object.values(request.votes).filter(
    (v) => v === "reflect",
  ).length;

  return (
    <div
      data-testid="narrative-vote-card"
      className="mx-auto max-w-md border border-dashed border-primary/30 rounded-lg bg-primary/5 p-4"
    >
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">📋</span>
        <span className="text-xs font-semibold uppercase tracking-widest text-primary">
          서사 반영 요청
        </span>
      </div>

      {/* 설명 */}
      <p className="text-sm text-text-secondary mb-3">
        {requester?.name ?? "알 수 없음"}이(가) #{request.rangeStart}~#
        {request.rangeEnd} 범위의 서사 반영을 요청했습니다.
      </p>

      {/* 참가자별 투표 상태 */}
      <div className="space-y-1.5 mb-3">
        {participants.map((p) => {
          const vote = request.votes[p.id] ?? "pending";
          return (
            <div
              key={p.id}
              data-testid={`vote-status-${p.id}`}
              className="flex items-center gap-2 text-sm"
            >
              <span className={cn("w-4 text-center", voteColor(vote))}>
                {voteIcon(vote)}
              </span>
              <span className="text-text">{p.name}:</span>
              <span className={cn("text-xs", voteColor(vote))}>
                {voteLabel(vote)}
              </span>
            </div>
          );
        })}
      </div>

      {/* 집계 + 상태 */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-secondary">
          동의: {reflectCount}/{request.totalParticipants}
        </span>

        {/* 완료 상태 메시지 */}
        {request.status === "approved" && (
          <span className="text-xs text-emerald-400 font-medium">
            서사 반영이 완료되었습니다.
          </span>
        )}
        {request.status === "rejected" && (
          <span className="text-xs text-accent font-medium">
            서사 반영이 취소되었습니다.
          </span>
        )}

        {/* 미투표 시 버튼 표시 */}
        {request.status === "voting" && !hasVoted && (
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => onVote("reflect")}
              data-testid="vote-reflect-btn"
            >
              ✔ 반영
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onVote("skip")}
              data-testid="vote-skip-btn"
            >
              ✖ 미반영
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
