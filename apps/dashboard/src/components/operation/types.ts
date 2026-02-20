/** 작전 타입 */
export type OperationType = "operation" | "downtime";

/** 작전 상태 */
export type OperationStatus = "waiting" | "live" | "completed";

/** 팀 참가자 */
export interface TeamMember {
  id: string;
  name: string;
}

/** 작전 아이템 */
export interface OperationItem {
  id: string;
  title: string;
  type: OperationType;
  status: OperationStatus;
  /** OPERATION: 아군 팀 */
  teamA: TeamMember[];
  /** OPERATION: 적군 팀 */
  teamB: TeamMember[];
  /** DOWNTIME: 호스트 */
  host: TeamMember;
  summary: string;
  maxParticipants: number;
  /** ISO date */
  createdAt: string;
  /** 운영자 메인 스토리 이벤트 여부 */
  isMainStory?: boolean;
}

/** 타입 필터 값 */
export type TypeFilter = "all" | "operation" | "downtime";

/** 상태 필터 값 */
export type StatusFilter = "all" | "waiting" | "live" | "completed";
