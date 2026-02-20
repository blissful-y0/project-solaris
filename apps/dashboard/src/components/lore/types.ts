/** Lore 카테고리 ID */
export type LoreCategoryId =
  | "overview"
  | "society"
  | "resonance"
  | "abilities"
  | "factions"
  | "battle-rules";

/** 기밀 등급 */
export type ClearanceLevel = 1 | 2 | 3;

/** 카테고리 메타 정보 */
export type LoreCategory = {
  id: LoreCategoryId;
  label: string;
  codeName: string;
  description: string;
  clearanceLevel: ClearanceLevel;
};

/** 파싱된 Lore 콘텐츠 */
export type LoreCategoryContent = {
  id: LoreCategoryId;
  html: string;
};

/** 기밀 등급 표시 설정 */
export const CLEARANCE_CONFIG: Record<
  ClearanceLevel,
  { label: string; textColor: string; borderColor: string; bgColor: string }
> = {
  1: { label: "PUBLIC", textColor: "text-emerald-400", borderColor: "border-emerald-400/40", bgColor: "bg-emerald-400" },
  2: { label: "RESTRICTED", textColor: "text-yellow-400", borderColor: "border-yellow-400/40", bgColor: "bg-yellow-400" },
  3: { label: "CLASSIFIED", textColor: "text-accent", borderColor: "border-accent/40", bgColor: "bg-accent" },
};

/** 카테고리 정의 목록 */
export const LORE_CATEGORIES: LoreCategory[] = [
  {
    id: "overview",
    label: "세계 개요",
    codeName: "WORLD-OVERVIEW",
    description: "솔라리스 도시의 구조와 외부 세계",
    clearanceLevel: 1,
  },
  {
    id: "society",
    label: "사회 구조",
    codeName: "CIVIC-STRUCTURE",
    description: "시민 등급 체계와 일상의 통제 구조",
    clearanceLevel: 1,
  },
  {
    id: "resonance",
    label: "공명율과 능력체계",
    codeName: "RESONANCE-PROTOCOL",
    description: "공명율 측정 원리와 능력 발현 메커니즘",
    clearanceLevel: 2,
  },
  {
    id: "abilities",
    label: "능력 분류",
    codeName: "ABILITY-REGISTRY",
    description: "역장, 감응, 변환, 연산 — 4계열 능력 특성",
    clearanceLevel: 2,
  },
  {
    id: "factions",
    label: "대립 구도",
    codeName: "FACTION-INTEL",
    description: "Enforcer와 The Static — 진영 간 긴장 관계",
    clearanceLevel: 1,
  },
  {
    id: "battle-rules",
    label: "전투 규칙",
    codeName: "COMBAT-DOCTRINE",
    description: "서술 기반 판정 체계와 교전 규칙",
    clearanceLevel: 3,
  },
];
