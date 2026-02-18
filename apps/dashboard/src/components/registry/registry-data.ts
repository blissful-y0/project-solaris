/** Registry 타입 정의 + 상수 + DB→UI 매핑 */

import type { Ability } from "@/components/common";

/** 카드 목록용 경량 타입 */
export interface RegistryCharacterSummary {
  id: string;
  isMine: boolean;
  name: string;
  faction: "bureau" | "static" | "defector";
  abilityClass: "field" | "empathy" | "shift" | "compute" | null;
  avatarUrl: string;
  isLeader: boolean;
}

/** 상세 모달용 전체 타입 */
export interface RegistryCharacter extends RegistryCharacterSummary {
  abilities: Ability[];
  hpMax: number;
  hpCurrent: number;
  willMax: number;
  willCurrent: number;
  appearance: string;
  backstory: string;
  resonanceRate: number;
  age?: number;
  gender?: string;
  personality?: string;
}

/* ─── 필터 옵션 ─── */
export const FACTION_OPTIONS = [
  { label: "전체", value: "all" },
  { label: "Bureau", value: "bureau" },
  { label: "Static", value: "static" },
] as const;

export const ABILITY_OPTIONS = [
  { label: "전체", value: "all" },
  { label: "역장", value: "field" },
  { label: "감응", value: "empathy" },
  { label: "변환", value: "shift" },
  { label: "연산", value: "compute" },
] as const;

/** 소속 풀네임 매핑 */
export const FACTION_FULL_NAME: Record<RegistryCharacterSummary["faction"], string> = {
  bureau: "Solaris Bureau of Civic Security",
  static: "The Static",
  defector: "전향자",
};

/** 능력 계열 한글 매핑 */
export const ABILITY_CLASS_LABEL: Record<string, string> = {
  field: "역장",
  empathy: "감응",
  shift: "변환",
  compute: "연산",
};

/* ─── profile_data JSON 파싱 ─── */
function parseProfileField(
  data: string | Record<string, string> | null | undefined,
  field: string,
): string | undefined {
  if (!data) return undefined;
  try {
    const parsed = typeof data === "string" ? JSON.parse(data) : data;
    const value = parsed?.[field];
    return typeof value === "string" && value.length > 0 ? value : undefined;
  } catch {
    return undefined;
  }
}

function parseProfileAge(
  data: string | Record<string, string> | null | undefined,
): number | undefined {
  if (!data) return undefined;
  try {
    const parsed = typeof data === "string" ? JSON.parse(data) : data;
    const raw = (parsed as Record<string, unknown>)?.age;

    if (typeof raw === "number" && Number.isFinite(raw) && raw >= 0) {
      return Math.floor(raw);
    }
    if (typeof raw === "string") {
      const n = Number(raw.trim());
      if (Number.isFinite(n) && n >= 0) return Math.floor(n);
    }
  } catch {
    return undefined;
  }
  return undefined;
}

/* ─── DB row → UI 타입 매핑 ─── */

const PLACEHOLDER_AVATAR = "/images/placeholder-avatar.png";
const ALLOWED_FACTIONS = ["bureau", "static", "defector"] as const;
const ALLOWED_ABILITY_CLASSES = ["field", "empathy", "shift", "compute"] as const;

function normalizeFaction(value: string): RegistryCharacterSummary["faction"] {
  if ((ALLOWED_FACTIONS as readonly string[]).includes(value)) {
    return value as RegistryCharacterSummary["faction"];
  }
  console.warn(`[registry] unknown faction value: ${value}`);
  return "defector";
}

function normalizeAbilityClass(value: string | null): RegistryCharacterSummary["abilityClass"] {
  if (!value) return null;
  if ((ALLOWED_ABILITY_CLASSES as readonly string[]).includes(value)) {
    return value as RegistryCharacterSummary["abilityClass"];
  }
  return null;
}

/** 목록 API 응답 → 카드용 Summary 변환 */
export function toCharacterSummary(row: {
  id: string;
  is_mine: boolean;
  name: string;
  faction: string;
  ability_class: string | null;
  profile_image_url: string | null;
  is_leader: boolean;
}): RegistryCharacterSummary {
  return {
    id: row.id,
    isMine: row.is_mine,
    name: row.name,
    faction: normalizeFaction(row.faction),
    abilityClass: normalizeAbilityClass(row.ability_class),
    avatarUrl: row.profile_image_url ?? PLACEHOLDER_AVATAR,
    isLeader: row.is_leader,
  };
}

/** 상세 API 응답 → 전체 RegistryCharacter 변환 */
export function toRegistryCharacter(row: {
  id: string;
  is_mine?: boolean;
  name: string;
  faction: string;
  ability_class: string | null;
  hp_max: number;
  hp_current: number;
  will_max: number;
  will_current: number;
  appearance: string | null;
  backstory: string | null;
  profile_image_url: string | null;
  is_leader: boolean;
  resonance_rate: number;
  profile_data?: string | Record<string, string> | null;
  abilities: {
    tier: "basic" | "mid" | "advanced";
    name: string;
    description: string;
    weakness: string;
    cost_hp: number;
    cost_will: number;
  }[];
}): RegistryCharacter {
  return {
    id: row.id,
    isMine: row.is_mine ?? false,
    name: row.name,
    faction: normalizeFaction(row.faction),
    abilityClass: normalizeAbilityClass(row.ability_class),
    avatarUrl: row.profile_image_url ?? PLACEHOLDER_AVATAR,
    isLeader: row.is_leader,
    hpMax: row.hp_max,
    hpCurrent: row.hp_current,
    willMax: row.will_max,
    willCurrent: row.will_current,
    appearance: row.appearance ?? "",
    backstory: row.backstory ?? "",
    resonanceRate: row.resonance_rate,
    age: parseProfileAge(row.profile_data),
    gender: parseProfileField(row.profile_data, "gender"),
    personality: parseProfileField(row.profile_data, "personality"),
    abilities: (row.abilities ?? []).map((a) => ({
      tier: a.tier,
      name: a.name,
      description: a.description,
      weakness: a.weakness,
      costHp: a.cost_hp,
      costWill: a.cost_will,
    })),
  };
}
