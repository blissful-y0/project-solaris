/** Registry 목 데이터 — 세계관 기반 캐릭터 12명 */

import type { Ability } from "@/components/common";

export interface RegistryCharacter {
  id: string;
  name: string;
  faction: "bureau" | "static" | "civilian";
  abilityClass: "field" | "empathy" | "shift" | "compute" | null;
  abilities: Ability[];
  hpMax: number;
  hpCurrent: number;
  willMax: number;
  willCurrent: number;
  appearance: string;
  backstory: string;
  avatarUrl: string;
  isLeader: boolean;
  resonanceRate: number;
}

const AVATAR_BASE =
  "https://images.unsplash.com/photo-";

/* ─── Bureau (5명) ─── */
const BUREAU_CHARS: RegistryCharacter[] = [
  {
    id: "reg-1",
    name: "아마츠키 레이",
    faction: "bureau",
    abilityClass: "field",
    abilities: [
      {
        tier: "basic",
        name: "압축 역장",
        description: "주변 3m 반경에 방어 역장을 형성한다.",
        weakness: "지속 시간 8초 이내, 연속 사용 시 효율 저하.",
        costAmount: 15,
        costType: "will",
      },
      {
        tier: "mid",
        name: "역장 분쇄",
        description: "집중된 역장을 투사체로 변환해 타겟에 충격을 가한다.",
        weakness: "시전 중 이동 불가, 근접 공격에 무방비.",
        costAmount: 30,
        costType: "will",
      },
      {
        tier: "advanced",
        name: "절대영역",
        description: "반경 10m의 역장 돔을 전개, 아군 보호 및 적 억제.",
        weakness: "WILL 대량 소모, 해제 후 1턴 행동 불가.",
        costAmount: 60,
        costType: "will",
      },
    ],
    hpMax: 80,
    hpCurrent: 72,
    willMax: 250,
    willCurrent: 190,
    appearance: "은발 단발. 왼쪽 눈 아래 작은 흉터. Bureau 정규 전투복 착용.",
    backstory:
      "헬리오스 코어 제1 경비대의 에이스. 코어 외곽 방어 작전에서 다수의 Static 침투를 저지한 기록이 있다.",
    avatarUrl: `${AVATAR_BASE}1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80`,
    isLeader: true,
    resonanceRate: 87,
  },
  {
    id: "reg-2",
    name: "세나 벨",
    faction: "bureau",
    abilityClass: "empathy",
    abilities: [
      {
        tier: "basic",
        name: "감정 판독",
        description: "대상의 감정 상태를 직감적으로 파악한다.",
        weakness: "물리적 접촉 거리 필요.",
        costAmount: 10,
        costType: "will",
      },
      {
        tier: "mid",
        name: "신경 공명 분석",
        description: "대상의 공명 패턴을 분석해 의도를 예측한다.",
        weakness: "대상이 공명 차단 장비 착용 시 무효.",
        costAmount: 25,
        costType: "will",
      },
      {
        tier: "advanced",
        name: "정신 동조",
        description: "아군의 정신을 동기화시켜 전투 효율을 극대화한다.",
        weakness: "동조 대상 중 1인이 기절하면 전원에게 피드백.",
        costAmount: 50,
        costType: "will",
      },
    ],
    hpMax: 80,
    hpCurrent: 80,
    willMax: 250,
    willCurrent: 225,
    appearance: "갈색 긴 머리. 차분한 인상. 분석실 근무복.",
    backstory:
      "공명율 변동 패턴을 추적해 전투 개시 신호를 예측하는 분석관.",
    avatarUrl: `${AVATAR_BASE}1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80`,
    isLeader: false,
    resonanceRate: 91,
  },
  {
    id: "reg-3",
    name: "이안 카르",
    faction: "bureau",
    abilityClass: "compute",
    abilities: [
      {
        tier: "basic",
        name: "전장 가시화",
        description: "전투 로그를 기반으로 아군 동선을 시각화한다.",
        weakness: "데이터 지연 0.5초, 실시간 판단에 한계.",
        costAmount: 10,
        costType: "will",
      },
      {
        tier: "mid",
        name: "전술 시뮬레이션",
        description: "3턴 이내의 전투 결과를 확률적으로 예측한다.",
        weakness: "변수가 많을수록 정확도 하락.",
        costAmount: 30,
        costType: "will",
      },
      {
        tier: "advanced",
        name: "오버클럭 연산",
        description: "HELIOS 연산 유닛에 직접 접속, 전장 전체를 분석한다.",
        weakness: "접속 해제 시 극심한 두통, 2턴 행동 패널티.",
        costAmount: 55,
        costType: "will",
      },
    ],
    hpMax: 80,
    hpCurrent: 65,
    willMax: 250,
    willCurrent: 200,
    appearance: "검정 안경. 마른 체형. 항상 단말기를 휴대.",
    backstory:
      "HELIOS 시스템의 전술 지원 모듈을 운용하는 오퍼레이터.",
    avatarUrl: `${AVATAR_BASE}1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80`,
    isLeader: false,
    resonanceRate: 85,
  },
  {
    id: "reg-4",
    name: "미카엘 로스",
    faction: "bureau",
    abilityClass: "field",
    abilities: [
      {
        tier: "basic",
        name: "경계 장벽",
        description: "좁은 통로에 역장 벽을 세워 적의 진입을 차단한다.",
        weakness: "단방향 차단만 가능, 측면 우회에 취약.",
        costAmount: 12,
        costType: "will",
      },
      {
        tier: "mid",
        name: "역장 감옥",
        description: "대상 1명을 역장 내부에 가둔다.",
        weakness: "유지 시간 4초, WILL 지속 소모.",
        costAmount: 35,
        costType: "will",
      },
      {
        tier: "advanced",
        name: "역장 폭렬",
        description: "역장을 급속 팽창시켜 범위 내 적에게 충격파를 가한다.",
        weakness: "아군도 범위 내면 피해, 발동 후 역장 재생성 2턴 불가.",
        costAmount: 50,
        costType: "will",
      },
    ],
    hpMax: 80,
    hpCurrent: 78,
    willMax: 250,
    willCurrent: 230,
    appearance: "체격이 큰 금발 남성. 중장갑 전투복.",
    backstory:
      "코어 외곽 방어선의 선임 요원. 물리적 차단 임무를 주로 수행한다.",
    avatarUrl: `${AVATAR_BASE}1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80`,
    isLeader: false,
    resonanceRate: 83,
  },
  {
    id: "reg-5",
    name: "리나 오르",
    faction: "bureau",
    abilityClass: "shift",
    abilities: [
      {
        tier: "basic",
        name: "물질 경화",
        description: "접촉한 물체의 경도를 일시적으로 강화한다.",
        weakness: "접촉 유지 필요, 범위 30cm.",
        costAmount: 10,
        costType: "will",
      },
      {
        tier: "mid",
        name: "구조 변환",
        description: "금속 구조물의 형태를 자유롭게 변형한다.",
        weakness: "유기물에는 적용 불가.",
        costAmount: 28,
        costType: "will",
      },
      {
        tier: "advanced",
        name: "분자 재배열",
        description: "물질의 분자 구조를 재설계, 새로운 소재를 생성한다.",
        weakness: "생성 질량 = 원본 질량, WILL 대량 소모.",
        costAmount: 55,
        costType: "will",
      },
    ],
    hpMax: 80,
    hpCurrent: 80,
    willMax: 250,
    willCurrent: 242,
    appearance: "짧은 흑발. 실험복 위에 Bureau 조끼.",
    backstory:
      "Bureau 기술 지원반 소속. 장비 수리와 현장 구조물 강화를 담당한다.",
    avatarUrl: `${AVATAR_BASE}1488426862026-3ee34a7d66df?auto=format&fit=crop&w=256&q=80`,
    isLeader: false,
    resonanceRate: 89,
  },
];

/* ─── Static (5명) ─── */
const STATIC_CHARS: RegistryCharacter[] = [
  {
    id: "reg-6",
    name: "크로우 제로",
    faction: "static",
    abilityClass: "shift",
    abilities: [
      {
        tier: "basic",
        name: "노이즈 침투",
        description: "전자 장비에 간섭 신호를 주입해 오작동을 유발한다.",
        weakness: "차폐된 장비에는 효과 감소.",
        costAmount: 15,
        costType: "hp",
      },
      {
        tier: "mid",
        name: "위상 변환",
        description: "자신의 신체를 일시적으로 반물질 상태로 전환한다.",
        weakness: "변환 중 공격 불가, 3초 제한.",
        costAmount: 30,
        costType: "hp",
      },
      {
        tier: "advanced",
        name: "노이즈 스톰",
        description: "반경 20m의 전자 기기를 전부 무력화한다.",
        weakness: "아군 장비도 영향, HP 대량 소모.",
        costAmount: 50,
        costType: "hp",
      },
    ],
    hpMax: 120,
    hpCurrent: 95,
    willMax: 150,
    willCurrent: 150,
    appearance: "검정 후드. 얼굴 절반을 가리는 마스크.",
    backstory:
      "도시 경계 밖에서 침투해 감시망을 무력화하는 Static 레이더.",
    avatarUrl: `${AVATAR_BASE}1531123897727-8f129e1688ce?auto=format&fit=crop&w=256&q=80`,
    isLeader: true,
    resonanceRate: 34,
  },
  {
    id: "reg-7",
    name: "마야 스트록",
    faction: "static",
    abilityClass: "field",
    abilities: [
      {
        tier: "basic",
        name: "중력 왜곡",
        description: "소범위의 중력 방향을 변경한다.",
        weakness: "반경 2m, 10초 유지 한계.",
        costAmount: 15,
        costType: "hp",
      },
      {
        tier: "mid",
        name: "중력 쇄도",
        description: "대상에게 급격한 중력 가속을 가해 움직임을 봉쇄한다.",
        weakness: "시선 집중 필요, 시야 밖 대상에 무효.",
        costAmount: 30,
        costType: "hp",
      },
      {
        tier: "advanced",
        name: "무중력 영역",
        description: "반경 15m를 무중력으로 전환, 적의 기동력을 완전 박탈.",
        weakness: "아군도 영향, 착지 충격 주의.",
        costAmount: 45,
        costType: "hp",
      },
    ],
    hpMax: 120,
    hpCurrent: 110,
    willMax: 150,
    willCurrent: 148,
    appearance: "붉은 머리카락. 전투 상흔이 다수. 비정규 전투복.",
    backstory:
      "헬리오스 코어 수송선 습격 작전을 지휘하는 Static 핵심 인물.",
    avatarUrl: `${AVATAR_BASE}1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80`,
    isLeader: false,
    resonanceRate: 28,
  },
  {
    id: "reg-8",
    name: "도미닉 펄",
    faction: "static",
    abilityClass: "shift",
    abilities: [
      {
        tier: "basic",
        name: "금속 공명",
        description: "금속 소재를 진동시켜 형태를 변경한다.",
        weakness: "비금속에 무효.",
        costAmount: 12,
        costType: "hp",
      },
      {
        tier: "mid",
        name: "장비 재구성",
        description: "파손된 장비를 현장에서 즉석 복원한다.",
        weakness: "원본 재료 50% 이상 필요.",
        costAmount: 25,
        costType: "hp",
      },
      {
        tier: "advanced",
        name: "금속 폭풍",
        description: "주변 금속 파편을 고속 투사체로 변환해 발사한다.",
        weakness: "금속 소재 부재 시 사용 불가.",
        costAmount: 40,
        costType: "hp",
      },
    ],
    hpMax: 120,
    hpCurrent: 118,
    willMax: 150,
    willCurrent: 145,
    appearance: "작업복 차림. 양손에 금속 파편이 항상 부착.",
    backstory:
      "폐허지대에서 장비를 재구성해 전선을 유지하는 정비 담당.",
    avatarUrl: `${AVATAR_BASE}1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80`,
    isLeader: false,
    resonanceRate: 31,
  },
  {
    id: "reg-9",
    name: "유키하라 사쿠",
    faction: "static",
    abilityClass: "empathy",
    abilities: [
      {
        tier: "basic",
        name: "감정 교란",
        description: "대상에게 혼란과 공포를 주입한다.",
        weakness: "정신력 높은 대상에 효과 감소.",
        costAmount: 12,
        costType: "hp",
      },
      {
        tier: "mid",
        name: "망각 유도",
        description: "대상의 최근 30초 기억을 흐리게 한다.",
        weakness: "접촉 필요, 1회 한정.",
        costAmount: 28,
        costType: "hp",
      },
      {
        tier: "advanced",
        name: "집단 최면",
        description: "반경 10m 내 적 전원의 인식을 일시 차단한다.",
        weakness: "시전 5초 필요, 중단 시 역류 피해.",
        costAmount: 45,
        costType: "hp",
      },
    ],
    hpMax: 120,
    hpCurrent: 72,
    willMax: 150,
    willCurrent: 140,
    appearance: "창백한 피부. 긴 은발. 눈동자 색이 자주 변한다.",
    backstory:
      "Bureau 추적을 교란하며 탈출에 특화된 Static 첩보 요원.",
    avatarUrl: `${AVATAR_BASE}1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80`,
    isLeader: false,
    resonanceRate: 22,
  },
  {
    id: "reg-10",
    name: "헥터 나인",
    faction: "static",
    abilityClass: "compute",
    abilities: [
      {
        tier: "basic",
        name: "시스템 해킹",
        description: "HELIOS 하위 노드에 무단 접근한다.",
        weakness: "보안 등급 3 이상 노드 접근 불가.",
        costAmount: 15,
        costType: "hp",
      },
      {
        tier: "mid",
        name: "데이터 오염",
        description: "감시 시스템의 데이터를 위조한다.",
        weakness: "HELIOS 메인 코어가 교정하면 즉시 탐지.",
        costAmount: 30,
        costType: "hp",
      },
      {
        tier: "advanced",
        name: "네트워크 장악",
        description: "구역 내 전체 네트워크 통신을 일시적으로 장악한다.",
        weakness: "HELIOS 대응 프로토콜 발동 시 역추적 위험.",
        costAmount: 50,
        costType: "hp",
      },
    ],
    hpMax: 120,
    hpCurrent: 100,
    willMax: 150,
    willCurrent: 150,
    appearance: "날카로운 눈매. 양손 손가락에 작은 단말 장치 부착.",
    backstory:
      "HELIOS 감시망의 취약점을 파고드는 Static의 정보전 전문가.",
    avatarUrl: `${AVATAR_BASE}1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80`,
    isLeader: false,
    resonanceRate: 19,
  },
];

/* ─── Civilian (2명) ─── */
const CIVILIAN_CHARS: RegistryCharacter[] = [
  {
    id: "reg-11",
    name: "하나 유이",
    faction: "civilian",
    abilityClass: null,
    abilities: [],
    hpMax: 60,
    hpCurrent: 60,
    willMax: 100,
    willCurrent: 100,
    appearance: "밝은 갈색 머리. 카페 유니폼.",
    backstory:
      "제2구역 카페 점주. 양 진영 인사가 모이는 중립 공간을 운영한다.",
    avatarUrl: `${AVATAR_BASE}1438761681033-6461ffad8d80?auto=format&fit=crop&w=256&q=80`,
    isLeader: false,
    resonanceRate: 55,
  },
  {
    id: "reg-12",
    name: "오스카 렌",
    faction: "civilian",
    abilityClass: null,
    abilities: [],
    hpMax: 60,
    hpCurrent: 58,
    willMax: 100,
    willCurrent: 95,
    appearance: "수염. 정비공 작업복. 기름 자국 다수.",
    backstory:
      "도시 인프라 정비사. HELIOS 시스템의 물리적 유지보수를 담당한다.",
    avatarUrl: `${AVATAR_BASE}1507591064344-4c6ce005b128?auto=format&fit=crop&w=256&q=80`,
    isLeader: false,
    resonanceRate: 50,
  },
];

export const REGISTRY_CHARACTERS: readonly RegistryCharacter[] = [
  ...BUREAU_CHARS,
  ...STATIC_CHARS,
  ...CIVILIAN_CHARS,
] as const;

/* ─── 필터 옵션 ─── */
export const FACTION_OPTIONS = [
  { label: "전체", value: "all" },
  { label: "Bureau", value: "bureau" },
  { label: "Static", value: "static" },
  { label: "비능력자", value: "civilian" },
] as const;

export const ABILITY_OPTIONS = [
  { label: "전체", value: "all" },
  { label: "역장", value: "field" },
  { label: "감응", value: "empathy" },
  { label: "변환", value: "shift" },
  { label: "연산", value: "compute" },
] as const;

/** 소속 풀네임 매핑 */
export const FACTION_FULL_NAME: Record<RegistryCharacter["faction"], string> = {
  bureau: "Solaris Bureau of Civic Security",
  static: "The Static",
  civilian: "비능력자",
};

/** 능력 계열 한글 매핑 */
export const ABILITY_CLASS_LABEL: Record<string, string> = {
  field: "역장",
  empathy: "감응",
  shift: "변환",
  compute: "연산",
};
