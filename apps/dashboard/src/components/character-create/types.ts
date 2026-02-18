/** 개별 스킬 티어 데이터 */
export interface SkillTier {
  name: string;
  description: string;
  costHp: string;
  costWill: string;
}

/** 캐릭터 생성 위자드 5단계 폼 데이터 */
export interface CharacterDraft {
  // Step 1: 팩션 선택
  faction: "bureau" | "static" | null;
  // Step 2: 능력 계열 선택
  abilityClass: "field" | "empathy" | "shift" | "compute" | null;
  // Step 3: 능력 설계
  /** 능력 전체 이름 (예: "중력 왜곡") */
  abilityName: string;
  /** 능력 전체 설명 */
  abilityDescription: string;
  /** 능력 제약/한계 */
  abilityConstraint: string;
  /** 능력 약점/부작용 */
  abilityWeakness: string;
  /** 티어별 스킬 (각각 이름, 설명, HP/WILL 코스트) */
  skills: {
    basic: SkillTier;
    mid: SkillTier;
    advanced: SkillTier;
  };
  // 크로스오버 전투 스타일 (선택사항)
  crossoverStyle: CrossoverStyle | null;
  // Step 4: 프로필 입력
  name: string;
  gender: string;
  age: string;
  /** 공명율 — Bureau: 80~100, Static: 0~15 */
  resonanceRate: string;
  appearance: string;
  personality: string;
  backstory: string;
  // Step 5: 확인 및 제출
  leaderApplication: boolean;
}

/** Bureau 크로스오버: 리미터 해제 */
/** Static 크로스오버: 외장형 연산 / 정신적 오버클럭 / 전향자 */
export type CrossoverStyle =
  | "limiter-override"
  | "hardware-bypass"
  | "dead-reckoning"
  | "defector";

const EMPTY_SKILL: SkillTier = {
  name: "",
  description: "",
  costHp: "",
  costWill: "",
};

export const EMPTY_DRAFT: CharacterDraft = {
  faction: null,
  abilityClass: null,
  abilityName: "",
  abilityDescription: "",
  abilityConstraint: "",
  abilityWeakness: "",
  skills: {
    basic: { ...EMPTY_SKILL },
    mid: { ...EMPTY_SKILL },
    advanced: { ...EMPTY_SKILL },
  },
  crossoverStyle: null,
  name: "",
  gender: "",
  age: "",
  resonanceRate: "",
  appearance: "",
  personality: "",
  backstory: "",
  leaderApplication: false,
};

export type Faction = NonNullable<CharacterDraft["faction"]>;
export type AbilityClass = NonNullable<CharacterDraft["abilityClass"]>;
