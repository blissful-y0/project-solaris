/** Pomi 프로파간다 광고 데이터 */
export interface PomiAdData {
  id: string;
  text: string;
  label?: string;
}

/** HELIOS 시민 통제 프로파간다 광고 목 데이터 */
export const pomiAds: PomiAdData[] = [
  { id: "pomi-1", text: "우울하신가요? 공명판 가까이 오세요!" },
  { id: "pomi-2", text: "높은 공명율은 건강한 시민의 증거입니다." },
  { id: "pomi-3", text: "HELIOS는 당신의 안녕을 기원합니다." },
];

/** 브리핑 데이터 타입 */
export interface Briefing {
  id: string;
  bulletinNumber: string;
  timestamp: string;
  category: "전투" | "정보" | "세력" | "사건" | "시스템";
  title: string;
  content: string;
  source: string;
}

/** 카테고리별 Badge variant 매핑 */
export const categoryVariant: Record<
  Briefing["category"],
  "danger" | "info" | "default" | "warning" | "success"
> = {
  전투: "danger",
  정보: "info",
  세력: "default",
  사건: "warning",
  시스템: "success",
};

/** 목 데이터 — 추후 API 교체 */
export const mockBriefings: Briefing[] = [
  {
    id: "b1",
    bulletinNumber: "BULLETIN_054",
    timestamp: "2026-02-17T14:00:00+09:00",
    category: "전투",
    title: "구역 7-B 다자간 교전 종결",
    content:
      "Bureau 제3기동반과 Static 잔존 세력 간 48시간 교전이 종결되었다. Bureau 측 능력자 2명 경상, Static 잔당 4명 무력화. 해당 구역은 현재 봉쇄 상태로 전환.",
    source: "HELIOS COMBAT SYSTEM",
  },
  {
    id: "b2",
    bulletinNumber: "BULLETIN_053",
    timestamp: "2026-02-17T12:00:00+09:00",
    category: "정보",
    title: "세력 동향 감청 — 미확인 신호 포착",
    content:
      "서울 외곽 폐허 지대에서 비정규 주파수 신호가 감지되었다. 기존 데이터베이스에 일치하는 패턴 없음. 정밀 분석 진행 중.",
    source: "HELIOS INTELLIGENCE",
  },
  {
    id: "b3",
    bulletinNumber: "BULLETIN_052",
    timestamp: "2026-02-17T10:00:00+09:00",
    category: "사건",
    title: "거짓 태양 방사선 경고 — 등급 상향",
    content:
      "금일 10:00부로 거짓 태양 방사선 수치가 경계 등급에서 위험 등급으로 상향 조정되었다. 지상 활동 시 방호복 착용 의무화.",
    source: "SOLARIS OBSERVATORY",
  },
  {
    id: "b4",
    bulletinNumber: "BULLETIN_051",
    timestamp: "2026-02-17T08:00:00+09:00",
    category: "세력",
    title: "SDF 제7기지 보급 노선 변경 공지",
    content:
      "구역 5 봉쇄에 따라 SDF 제7기지 보급 노선이 우회 경로로 변경된다. 신규 노선은 구역 9를 경유하며, 호위 인원이 증편된다.",
    source: "SDF LOGISTICS",
  },
  {
    id: "b5",
    bulletinNumber: "BULLETIN_050",
    timestamp: "2026-02-17T06:00:00+09:00",
    category: "정보",
    title: "신규 능력자 식별 — 코드네임 미지정",
    content:
      "구역 12 폐건물에서 미등록 능력 반응이 감지되었다. 예상 공명율 62~71%. Bureau 접촉반 파견 승인 대기 중.",
    source: "HELIOS INTELLIGENCE",
  },
  {
    id: "b6",
    bulletinNumber: "BULLETIN_049",
    timestamp: "2026-02-17T04:00:00+09:00",
    category: "시스템",
    title: "HELIOS 코어 정기 점검 완료",
    content:
      "HELIOS 중앙 처리 코어 정기 점검이 완료되었다. 전투 판정 모듈 v2.4.1 적용. 공명율 측정 정밀도 0.3% 향상.",
    source: "HELIOS CORE",
  },
  {
    id: "b7",
    bulletinNumber: "BULLETIN_048",
    timestamp: "2026-02-17T02:00:00+09:00",
    category: "전투",
    title: "구역 3 경계 교전 발생",
    content:
      "심야 시간대 구역 3 외곽에서 소규모 교전이 보고되었다. Static 척후 병력 추정 3명이 SDF 초소에 접근, 경고 사격 후 철수.",
    source: "HELIOS COMBAT SYSTEM",
  },
  {
    id: "b8",
    bulletinNumber: "BULLETIN_047",
    timestamp: "2026-02-17T00:00:00+09:00",
    category: "사건",
    title: "구역 11 통신 두절 — 원인 조사 중",
    content:
      "구역 11 전역에서 통신 두절이 발생하였다. 거짓 태양 방사선 간섭 또는 의도적 재밍 가능성. 복구 작업 진행 중.",
    source: "SOLARIS OBSERVATORY",
  },
];
