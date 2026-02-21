"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import type { ActionType, BattleSessionData, ChatMessage, TurnPhase } from "./types";
import { SessionStatBar } from "./SessionStatBar";
import { ChatLog } from "./ChatLog";
import { ActionInput } from "./ActionInput";

type BattleSessionProps = {
  initialData: BattleSessionData;
  /**
   * 서술 제출 후 백엔드에 저장하는 콜백 (선택).
   * 로컬 낙관적 업데이트는 컴포넌트 내에서 처리하므로
   * 이 콜백은 영속성 저장만 담당한다.
   */
  onAction?: (narration: string) => Promise<void>;
  className?: string;
};

export function BattleSession({ initialData, onAction, className }: BattleSessionProps) {
  /* 상태 관리 (목 데이터 기반, 향후 Realtime 연동) */
  const [session, setSession] = useState(initialData);

  const myParticipant = useMemo(
    () => session.participants.find((p) => p.id === session.myParticipantId),
    [session.participants, session.myParticipantId],
  );

  const allies = useMemo(
    () => session.participants.filter((p) => p.team === "ally"),
    [session.participants],
  );

  const enemies = useMemo(
    () => session.participants.filter((p) => p.team === "enemy"),
    [session.participants],
  );

  /* 행동 제출 핸들러 (목 데이터에서는 로컬 메시지 추가) */
  const handleSubmit = useCallback(
    (data: {
      actionType: ActionType;
      abilityId: string;
      targetId: string;
      narration: string;
    }) => {
      if (!myParticipant) return;

      const ability = myParticipant.abilities.find((a) => a.id === data.abilityId);
      const target = session.participants.find((p) => p.id === data.targetId);

      const newMessage: ChatMessage = {
        id: `msg-user-${Date.now()}`,
        type: "narration",
        senderId: myParticipant.id,
        senderName: myParticipant.name,
        content: data.narration,
        timestamp: new Date().toISOString(),
        isMine: true,
        action: {
          actionType: data.actionType,
          abilityName: ability?.name ?? "",
          targetName: target?.name ?? "",
        },
      };

      setSession((prev) => ({
        ...prev,
        messages: [...prev.messages, newMessage],
        phase: "waiting" as TurnPhase,
      }));

      /* 백엔드 저장 (낙관적 업데이트 이후, 실패해도 로컬 메시지는 유지) */
      if (onAction) {
        void onAction(data.narration);
      }
    },
    [myParticipant, session.participants, onAction],
  );

  if (!myParticipant) {
    return (
      <div className="flex items-center justify-center h-full text-text-secondary">
        참가자 정보를 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div className={cn(
      "flex flex-col",
      /* 모바일: TopBar+Ticker(pt-22=5.5rem) + MobileTabBar(pb-16=4rem) */
      "h-[calc(100dvh-5.5rem-4rem)]",
      /* 데스크탑: TopBar+Ticker만 (사이드바는 옆에 있으므로 하단 패딩 없음) */
      "md:h-[calc(100dvh-5.5rem)]",
      className,
    )}>
      {/* 상단 바 */}
      <header className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-bg-secondary/80 flex-shrink-0">
        <Link
          href="/operation"
          className="text-text-secondary hover:text-text transition-colors"
          aria-label="작전 목록으로 돌아가기"
        >
          ←
        </Link>
        <h1 className="text-sm font-semibold text-text truncate flex-1">
          {session.title}
        </h1>
        <span className="hud-label text-[0.5rem]">
          TURN {session.currentTurn}
        </span>
      </header>

      {/* HP/WILL 미니 바 */}
      <SessionStatBar participants={session.participants} />

      {/* 채팅 로그 */}
      <ChatLog messages={session.messages} className="flex-1 min-h-0" />

      {/* 행동 선언 + 서술 입력 */}
      <ActionInput
        phase={session.phase}
        currentTurn={session.currentTurn}
        myParticipant={myParticipant}
        allies={allies}
        enemies={enemies}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
