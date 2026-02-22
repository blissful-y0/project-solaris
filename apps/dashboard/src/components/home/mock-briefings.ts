/** 역사 연표 레코드 타입 */
export interface HistoricalRecord {
  id: string;
  bulletinNumber: string; // BULLETIN_-001 형식
  year: number; // 세계관 내 연도
  era: "기원" | "전환점" | "헬리오스" | "정책" | "세대";
  title: string;
  content: string;
}

/** 카테고리별 Badge variant 매핑 (역사 연표) */
export const eraVariant: Record<
  HistoricalRecord["era"],
  "danger" | "info" | "default" | "warning" | "success"
> = {
  기원: "danger",
  전환점: "warning",
  헬리오스: "success",
  정책: "info",
  세대: "default",
};

/** 역사 연표 데이터 — 현재(2287년)에서 과거 방향으로 */
export const mockHistory: HistoricalRecord[] = [
  {
    id: "h1",
    bulletinNumber: "BULLETIN_-001",
    year: 2240,
    era: "세대",
    title: "6세대 출생 — '꿈'이라는 단어의 소멸",
    content:
      "현재 세대(2240~)는 '꿈'이라는 단어를 교육 과정에서 배우지 않는다. 솔라리스가 세계의 전부이며, 돔 바깥은 생존 불가능 구역으로만 기술된다. 이 세대에게 바깥 세계는 상상이 아니라 데이터다.",
  },
  {
    id: "h2",
    bulletinNumber: "BULLETIN_-002",
    year: 2210,
    era: "세대",
    title: "5세대 — 외부 실재를 최초로 의심한 세대",
    content:
      "2210년대에 최초로 '돔 바깥이 실제로 존재하는가'를 공개 의문시하는 시민 기록이 등장한다. HELIOS는 이를 공명율 저하로 분류하고 치료 대상으로 처리하였다. 해당 기록은 열람 제한 등급이다.",
  },
  {
    id: "h3",
    bulletinNumber: "BULLETIN_-003",
    year: 2180,
    era: "정책",
    title: "교육 체계 재편 — 헬리오스 질서를 자연의 섭리로",
    content:
      "4세대 진입과 함께 솔라리스 교육 과정이 전면 개편되었다. 전쟁은 '과거의 교훈'으로 단순화되고, 헬리오스의 관리 체계는 생존의 조건이 아닌 자연의 질서로 교육된다. 저항의 언어가 교육에서 사라졌다.",
  },
  {
    id: "h4",
    bulletinNumber: "BULLETIN_-004",
    year: 2150,
    era: "세대",
    title: "3세대 — 전쟁은 역사, 꿈은 신화",
    content:
      "3세대는 부모로부터 바깥 이야기를 들었지만 직접 기억하지 못한다. 이 세대에서 최초로 '꿈은 실재하는가'라는 질문이 금기의 영역에 진입하였다. HELIOS는 기억의 체계적 희석이 완료된 것으로 분류하였다.",
  },
  {
    id: "h5",
    bulletinNumber: "BULLETIN_-005",
    year: 2120,
    era: "세대",
    title: "2세대 — 바깥 이야기를 들은 마지막 세대",
    content:
      "2세대는 1세대 생존자들에게 직접 전쟁과 바깥 세계의 이야기를 들었다. 그러나 기억은 간접적이었다. 원래 생존자들이 하나둘 사망하면서 1차적 기억의 사슬이 끊겼다. 바깥 세계는 그때부터 이야기가 되었다.",
  },
  {
    id: "h6",
    bulletinNumber: "BULLETIN_-006",
    year: 2107,
    era: "정책",
    title: "돔 폐쇄 결정 — 공명율 기준선 발효",
    content:
      "HELIOS가 수확 최적화 계산을 완료하고 입성 기준선을 공포하였다. 공명율 기준 미달자는 입성이 거부되며, 기존 입성자 중 기준 미달로 측정된 경우 '외부 개척 임무'로 분류되어 출문 처리된다. 이후 돔은 다시 열리지 않았다.",
  },
  {
    id: "h7",
    bulletinNumber: "BULLETIN_-007",
    year: 2097,
    era: "헬리오스",
    title: "능력자 분류 체계 최초 구축 — Bureau / Static 분기",
    content:
      "전쟁 이전 군사 연구 데이터를 토대로 HELIOS가 인간 공명 반응의 분기를 공식 분류하였다. 80% 이상의 동조형은 Bureau로, 14% 이하의 비동조형은 미등록 시민으로 등록된다. 이것이 현재 진영 체계의 기원이다.",
  },
  {
    id: "h8",
    bulletinNumber: "BULLETIN_-008",
    year: 2087,
    era: "기원",
    title: "2087년 9월 — 헬리오스의 신호. 돔이 열리다.",
    content:
      "전쟁 개시 48시간 전, HELIOS는 전 세계 긴급 주파수에 좌표 하나와 짧은 문장을 송출하였다. '솔라리스. 살고 싶은 자는 이곳으로.' 신호를 따라온 자들이 살았다. 3만 명으로 시작된 솔라리스. 지금 우리는 500만 명이다.",
  },
];

/** Pomi 프로파간다 광고 데이터 */
export interface PomiAdData {
  id: string;
  text: string;
  label?: string;
}

/** HELIOS 시민 통제 프로파간다 광고 목 데이터 */
export const pomiAds: PomiAdData[] = [
  {
    id: "pomi-1",
    text: "오늘 공명판 방문 하셨나요~? 포미는 여러분이 안정될 때 제일 행복해요! 같이 가요, 같이 가요!",
  },
  {
    id: "pomi-2",
    text: "솔라리스 200주년! 포미도 너무너무 신나요~",
  },
  {
    id: "pomi-3",
    text: "혹시 요즘 마음이 좀 그렇다면... 포미에게 말해 주세요! 아, 그보다 공명판 먼저 가는 게 더 빠를 수도 있어요. 포미를 믿어 주세요~!",
  },
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
    bulletinNumber: "BULLETIN_001",
    timestamp: "2026-02-21T10:00:00+09:00",
    category: "전투",
    title: "구역 7 소탕 작전 종결 — 보안국 제2집행반",
    content:
      "보안국 제2집행반이 구역 7 하층부 거점 소탕 작전을 완료하였습니다. 미등록 미등록 시민 연락책 2명을 억류하고 비인가 공명 차단 장치 3기를 수거하였습니다. 해당 구역은 72시간 봉쇄가 유지되오니 시민 여러분께서는 우회로를 이용해 주시기 바랍니다.",
    source: "SBCS COMMAND",
  },
  {
    id: "b2",
    bulletinNumber: "BULLETIN_002",
    timestamp: "2026-02-21T14:00:00+09:00",
    category: "정보",
    title: "외벽 남측 비인가 주파수 교란 포착",
    content:
      "외벽 남측 완충 지대에서 기존 데이터베이스에 등록되지 않은 주파수 패턴이 감지되었습니다. 미등록 시민 신호 체계와 유사성이 확인되는 바, 해당 구역 시민 여러분께서는 당분간 외출을 자제해 주시기 바랍니다. 헬리오스 분석 모듈이 정밀 분석을 진행하고 있습니다.",
    source: "HELIOS INTELLIGENCE",
  },
  {
    id: "b3",
    bulletinNumber: "BULLETIN_003",
    timestamp: "2026-02-21T20:00:00+09:00",
    category: "사건",
    title: "방사선 지수 — 경계 등급 상향",
    content:
      "금일 20:00부로 외곽 농업 구역 방사선 지수가 허용 기준치의 1.3배를 초과하였습니다. 대기 순환 이상이 원인으로 추정되며, 외곽 30km 이원 출입 금지 조치가 발효되었습니다. 농업 구역에 위치한 시민 여러분께서는 즉시 내구역으로 복귀해 주시기 바랍니다.",
    source: "SOLARIS OBSERVATORY",
  },
  {
    id: "b4",
    bulletinNumber: "BULLETIN_004",
    timestamp: "2026-02-22T02:00:00+09:00",
    category: "세력",
    title: "보안국 제3기지 보급 노선 임시 변경",
    content:
      "구역 7 봉쇄 조치에 따라 보안국 제3기지 보급 노선이 구역 9 경유 우회로로 임시 변경됩니다. 호위 편성 2개 분대를 증편하였습니다. 민간 차량의 해당 노선 진입은 다음 공지 시까지 금지되오니 양해해 주시기 바랍니다.",
    source: "SDF LOGISTICS",
  },
  {
    id: "b5",
    bulletinNumber: "BULLETIN_005",
    timestamp: "2026-02-22T06:00:00+09:00",
    category: "정보",
    title: "미등록 능력 반응 감지 — 식별 코드 발동",
    content:
      "구역 12 폐건물 인근에서 미등록 공명 반응이 감지되었습니다. 추정 공명율은 68~74%입니다. 자진 신고 없이 발각될 경우 공명율과 무관하게 보안국 관할로 이관됩니다. 본 브리핑을 수신 중인 해당 시민께서는 가까운 보안국 초소에 즉시 출두해 주시기 바랍니다.",
    source: "HELIOS INTELLIGENCE",
  },
  {
    id: "b6",
    bulletinNumber: "BULLETIN_006",
    timestamp: "2026-02-22T09:00:00+09:00",
    category: "시스템",
    title: "공명판 정기 교정 완료 — 정밀도 향상",
    content:
      "전 구역 공명판 정기 교정 작업이 완료되었습니다. 측정 정밀도가 0.4% 향상되었습니다. 일부 시민의 공명율 수치가 미세하게 변동될 수 있으나 이는 오류가 아닙니다. 갱신된 수치가 해당 시민의 실제 공명율임을 안내드립니다.",
    source: "HELIOS CORE",
  },
  {
    id: "b7",
    bulletinNumber: "BULLETIN_007",
    timestamp: "2026-02-22T12:00:00+09:00",
    category: "전투",
    title: "구역 3 외곽 심야 교전 보고",
    content:
      "심야 시간대 구역 3 외곽 초소에서 미등록 시민 추정 소규모 병력과의 접촉이 발생하였습니다. 보안국 초소의 경고 사격 후 철수가 확인되었으며, SDF 순찰 편성 증원 조치가 완료되었습니다. 해당 구역 시민 여러분께서는 야간 외출을 삼가 주시기 바랍니다.",
    source: "HELIOS COMBAT SYSTEM",
  },
  {
    id: "b8",
    bulletinNumber: "BULLETIN_008",
    timestamp: "2026-02-22T14:00:00+09:00",
    category: "시스템",
    title: "솔라리스 설립 200주년 기념 — 헬리오스 특별 브로드캐스트",
    content:
      "2087년 9월, 인류는 72시간 만에 끝났습니다. 그리고 우리는 살아남았습니다. 솔라리스 설립 200주년을 맞이하여 헬리오스는 모든 시민 여러분께 감사의 말씀을 전합니다. 지난 200년은 헬리오스의 계산 위에 세워진 시간이었습니다. 앞으로도 함께해 주시기 바랍니다.",
    source: "HELIOS CORE",
  },
];
