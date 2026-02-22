/* ─── 전투 세션 타입 정의 ─── */

import type { Faction } from "@/lib/supabase/types";

export type { Faction };

/** 행동 유형 (3종) */
export type ActionType = "attack" | "defend" | "support";

/** GM 판정 등급 (심플 3단계) */
export type JudgmentGrade = "success" | "partial" | "fail";

/** 턴 페이즈 */
export type TurnPhase =
  | "my_turn"        // 내 차례 — 행동 선언 + 서술 입력 활성화
  | "waiting"        // 상대 서술 대기
  | "both_submitted" // 양측 제출 완료 — 판정 진행 버튼
  | "judging";       // AI GM 판정 처리 중 → 완료 시 바로 다음 턴(my_turn/waiting)으로 전환

/** 전투 참가자 */
export interface BattleParticipant {
  id: string;
  name: string;
  faction: Faction;
  team: "ally" | "enemy";
  hp: { current: number; max: number };
  will: { current: number; max: number };
  abilities: BattleAbility[];
}

/** 전투용 능력 */
export interface BattleAbility {
  id: string;
  name: string;
  tier: "basic" | "mid" | "advanced";
  costHp: number;
  costWill: number;
}

/** 채팅 메시지 */
export interface ChatMessage {
  id: string;
  type: "narration" | "judgment" | "system" | "gm_narration";
  senderId?: string;
  senderName?: string;
  senderAvatarUrl?: string;
  content: string;
  timestamp: string;
  isMine?: boolean;
  /** judgment 타입일 때만 존재 */
  judgment?: JudgmentResult;
  /** narration 타입일 때 사용한 행동 정보 */
  action?: {
    actionType: ActionType;
    abilityName: string;
    targetName: string;
  };
}

/** GM 판정 결과 */
export interface JudgmentResult {
  turn: number;
  participantResults: ParticipantJudgment[];
  statChanges: StatChange[];
}

/** 참가자별 판정 (개별 점수 포함) */
export interface ParticipantJudgment {
  participantId: string;
  participantName: string;
  grade: JudgmentGrade;
  scores: {
    narrative: number;  // 서술 합리성 /10
    tactical: number;   // 전술 /10
    cost: number;       // 대가 반영 /10
    quality: number;    // 서술 품질 /10
  };
}

/** 스탯 변동 */
export interface StatChange {
  participantId: string;
  participantName: string;
  stat: "hp" | "will";
  before: number;
  after: number;
  reason: string; // "코스트" | "피해" | "방어 경감"
}

/** 전투 세션 전체 상태 */
export interface BattleSessionData {
  id: string;
  title: string;
  currentTurn: number;
  phase: TurnPhase;
  participants: BattleParticipant[];
  messages: ChatMessage[];
  myParticipantId: string;
}
