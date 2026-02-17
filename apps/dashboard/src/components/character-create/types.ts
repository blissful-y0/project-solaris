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
  // 크로스오버 전투 스타일 (선택사항)
  crossoverStyle: CrossoverStyle | null;
  // Step 4: 프로필 입력
  name: string;
  gender: string;
  age: string;
  appearance: string;
  personality: string;
  backstory: string;
}

/** Bureau 크로스오버: 리미터 해제 */
/** Static 크로스오버: 외장형 연산 / 정신적 오버클럭 / 전향자 */
export type CrossoverStyle =
  | "limiter-override"
  | "hardware-bypass"
  | "dead-reckoning"
  | "defector";

export const EMPTY_DRAFT: CharacterDraft = {
  faction: null,
  abilityClass: null,
  abilityName: "",
  abilityDescription: "",
  abilityConstraint: "",
  abilityTierBasic: "",
  abilityTierMid: "",
  abilityTierAdvanced: "",
  crossoverStyle: null,
  name: "",
  gender: "",
  age: "",
  appearance: "",
  personality: "",
  backstory: "",
};

export type Faction = NonNullable<CharacterDraft["faction"]>;
export type AbilityClass = NonNullable<CharacterDraft["abilityClass"]>;
