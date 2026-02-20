/** Helios Core 목 데이터 — 세계관 기반 */

export interface TimelineEntry {
  id: string;
  timestamp: string;
  title: string;
  summary: string;
  severity: "critical" | "alert" | "info";
}

export interface CoreNotice {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  createdAt: string;
}

export interface BattleHighlight {
  id: string;
  participants: string;
  result: string;
  gmSummary: string;
  date: string;
}

export interface SystemStatus {
  arcProgress: number;
  cityResonance: number;
  activeOperations: number;
}

/* ─── 타임라인 (최신순) ─── */
export const CORE_TIMELINE: readonly TimelineEntry[] = [
  {
    id: "tl-1",
    timestamp: "2026-02-18 22:14",
    title: "제3구역 검문 강화 — Enforcer 긴급 배치",
    summary:
      "남서 외곽 경계선에서 비인가 공명 반응이 연속 감지됨. SBCS 제2분대가 검문 강화 명령을 수신했습니다.",
    severity: "critical",
  },
  {
    id: "tl-2",
    timestamp: "2026-02-18 21:46",
    title: "미확인 공명 반응 감지 — 센서 클러스터 B-7",
    summary:
      "동부 감시축 센서 신뢰도가 81%로 하락. 수동 보정 프로토콜이 가동되었습니다.",
    severity: "alert",
  },
  {
    id: "tl-3",
    timestamp: "2026-02-18 20:33",
    title: "에너지 코어 2차 냉각 완료",
    summary:
      "코어 출력이 정상 범위로 복귀했습니다. 다음 정기 점검은 06:00 예정.",
    severity: "info",
  },
  {
    id: "tl-4",
    timestamp: "2026-02-18 19:12",
    title: "Static 유격대 활동 징후 포착",
    summary:
      "열교환실 인근에서 비동조형 시그니처 3건이 포착되었습니다. 경계 태세 격상.",
    severity: "alert",
  },
  {
    id: "tl-5",
    timestamp: "2026-02-18 18:00",
    title: "Enforcer 순찰대 야간 교대 완료",
    summary:
      "야간 경비 프로토콜로 전환됩니다. 제1~제4 순찰 경로 정상 가동 중.",
    severity: "info",
  },
  {
    id: "tl-6",
    timestamp: "2026-02-18 16:45",
    title: "HELIOS 시스템 정기 진단 보고",
    summary:
      "코어 연산 유닛 전체 가동률 98.2%. 메모리 블록 C-4에서 경미한 지연 발견, 자동 복구 완료.",
    severity: "info",
  },
  {
    id: "tl-7",
    timestamp: "2026-02-18 14:20",
    title: "통신 중계소 B-7 복구 완료",
    summary:
      "장애 구간 우회 경로가 비활성화되었습니다. 전 채널 정상 통신 확인.",
    severity: "info",
  },
] as const;

/* ─── 관리자 공지 ─── */
export const CORE_NOTICES: readonly CoreNotice[] = [
  {
    id: "notice-1",
    title: "시즌 0 사전 브리핑 안내",
    content:
      "제1차 ARC 시즌이 03.01에 개시됩니다. 참가 희망 시민은 캐릭터 승인을 완료해 주세요.",
    pinned: true,
    createdAt: "2026-02-18",
  },
  {
    id: "notice-2",
    title: "전투 규칙 업데이트 v1.2",
    content:
      "하모닉스 프로토콜/오버드라이브 판정 수식이 일부 조정되었습니다. 상세 내용은 Lore 탭을 참조하세요.",
    pinned: true,
    createdAt: "2026-02-17",
  },
  {
    id: "notice-3",
    title: "정기 점검 안내 (02.19 03:00~05:00)",
    content:
      "HELIOS 시스템 정기 점검이 진행됩니다. 해당 시간 동안 대시보드 접속이 제한될 수 있습니다.",
    pinned: false,
    createdAt: "2026-02-16",
  },
  {
    id: "notice-4",
    title: "비인가 로그 아카이브 열람 경고",
    content:
      "승인되지 않은 기밀 파일 접근 시 계정이 즉시 잠금됩니다. HELIOS 보안 프로토콜을 준수하세요.",
    pinned: false,
    createdAt: "2026-02-15",
  },
] as const;

/* ─── 전투 하이라이트 ─── */
export const BATTLE_HIGHLIGHTS: readonly BattleHighlight[] = [
  {
    id: "battle-1",
    participants: "아마츠키 레이 vs 카이토 진",
    result: "아마츠키 레이 승리",
    gmSummary:
      "역장 계열 방어막이 감응 계열 정신 간섭을 완전히 차단. 7턴 만에 결착.",
    date: "02.18",
  },
  {
    id: "battle-2",
    participants: "제2분대 vs Static 유격조",
    result: "Enforcer 승리 (작전 성공)",
    gmSummary:
      "코어 외곽 침투 시도를 제압. 연산 계열 지원 사격이 결정적 역할.",
    date: "02.17",
  },
  {
    id: "battle-3",
    participants: "유키하라 사쿠 vs Enforcer 경비원 2명",
    result: "유키하라 사쿠 탈출 성공",
    gmSummary:
      "변환 계열 능력으로 추적을 교란하며 퇴로 확보. HP 40% 소모.",
    date: "02.16",
  },
] as const;

/* ─── 시스템 상태 ─── */
export const SYSTEM_STATUS: SystemStatus = {
  arcProgress: 35,
  cityResonance: 82.4,
  activeOperations: 7,
} as const;
