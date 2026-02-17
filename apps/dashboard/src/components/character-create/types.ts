/** 캐릭터 생성 위자드 5단계 폼 데이터 */
export interface CharacterDraft {
  // Step 1: 팩션 선택
  faction: "bureau" | "static" | null;
  // Step 2: 능력 계열 선택
  abilityClass: "field" | "empathy" | "shift" | "compute" | null;
  // Step 3: 능력 설계
  abilityName: string;
  abilityDescription: string;
  abilityConstraint: string;
  abilityTierBasic: string;
  abilityTierMid: string;
  abilityTierAdvanced: string;
  abilityCostType: "will" | "hp" | null;
  // Step 4: 프로필 입력
  name: string;
  gender: string;
  age: string;
  appearance: string;
  personality: string;
  backstory: string;
}

export const EMPTY_DRAFT: CharacterDraft = {
  faction: null,
  abilityClass: null,
  abilityName: "",
  abilityDescription: "",
  abilityConstraint: "",
  abilityTierBasic: "",
  abilityTierMid: "",
  abilityTierAdvanced: "",
  abilityCostType: null,
  name: "",
  gender: "",
  age: "",
  appearance: "",
  personality: "",
  backstory: "",
};

export type Faction = NonNullable<CharacterDraft["faction"]>;
export type AbilityClass = NonNullable<CharacterDraft["abilityClass"]>;
export type CostType = NonNullable<CharacterDraft["abilityCostType"]>;
