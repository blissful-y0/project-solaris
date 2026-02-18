/** Lore 카테고리 ID */
export type LoreCategoryId =
  | "overview"
  | "society"
  | "resonance"
  | "abilities"
  | "factions"
  | "battle-rules";

/** 카테고리 메타 정보 */
export type LoreCategory = {
  id: LoreCategoryId;
  label: string;
  description: string;
};

/** 파싱된 Lore 콘텐츠 */
export type LoreCategoryContent = {
  id: LoreCategoryId;
  html: string;
};

/** 카테고리 정의 목록 */
export const LORE_CATEGORIES: LoreCategory[] = [
  { id: "overview", label: "개요", description: "세계 개요와 외부 세계" },
  { id: "society", label: "사회구조", description: "사회 구조와 시민 일상" },
  {
    id: "resonance",
    label: "공명율과 능력체계",
    description: "공명율과 능력 체계",
  },
  { id: "abilities", label: "능력분류", description: "능력 유형별 특성" },
  { id: "factions", label: "대립구도", description: "진영 구조와 대립 구도" },
  { id: "battle-rules", label: "배틀룰", description: "전투 시스템 규칙" },
];
