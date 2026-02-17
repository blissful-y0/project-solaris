/** 공명 태스크 — HELIOS 지시 시스템 목 데이터 */

export type TaskType = "BATTLE" | "SYSTEM" | "RP";

export interface ResonanceTask {
  id: string;
  type: TaskType;
  message: string;
  count?: number;
  route: string;
}

/** 타입별 Badge variant 매핑 */
export const taskTypeVariant: Record<TaskType, "danger" | "success" | "warning"> = {
  BATTLE: "danger",
  SYSTEM: "success",
  RP: "warning",
};

export const mockTasks: ResonanceTask[] = [
  {
    id: "t1",
    type: "BATTLE",
    message: "도전자가 대기 중입니다.",
    count: 1,
    route: "/operation",
  },
  {
    id: "t2",
    type: "SYSTEM",
    message: "오늘의 기분 보고가 누락되었습니다.",
    route: "/operation",
  },
  {
    id: "t3",
    type: "RP",
    message: "야간 순찰 채널에 참여 요청이 있습니다.",
    route: "/operation",
  },
];
