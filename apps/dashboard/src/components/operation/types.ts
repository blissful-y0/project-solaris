/** 작전 타입 */
export type OperationType = "전투" | "RP";

/** 작전 상태 */
export type OperationStatus = "대기중" | "진행중" | "완료";

/** 작전 아이템 */
export interface OperationItem {
  id: string;
  title: string;
  type: OperationType;
  status: OperationStatus;
  participants: number;
  maxParticipants: number;
  host: string;
  summary: string;
}

/** 탭 필터 값 */
export type OperationTabValue = "전체" | "전투" | "RP";

/** 상태 필터 값 */
export type OperationStatusFilter = "전체" | "대기중" | "진행중" | "완료";
