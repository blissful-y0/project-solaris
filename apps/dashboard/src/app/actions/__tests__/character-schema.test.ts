import { describe, expect, it } from "vitest";
import { characterDraftSchema } from "../character-schema";

const validDraft = {
  name: "아마츠키 레이",
  faction: "bureau" as const,
  abilityClass: "field" as const,
  resonanceRate: 85,
  profileData: { age: "25", gender: "남성" },
  leaderApplication: false,
  abilities: [
    { tier: "basic" as const, name: "역장 발생", description: "역장 생성", costHp: 0, costWill: 10 },
    { tier: "mid" as const, name: "역장 확장", description: "역장 범위 확대", costHp: 0, costWill: 20 },
    { tier: "advanced" as const, name: "중력 왜곡", description: "중력 조작", costHp: 0, costWill: 40 },
  ],
};

describe("characterDraftSchema", () => {
  it("올바른 draft를 통과시킨다", () => {
    const result = characterDraftSchema.safeParse(validDraft);
    expect(result.success).toBe(true);
  });

  it("이름이 2자 미만이면 거부한다", () => {
    const result = characterDraftSchema.safeParse({ ...validDraft, name: "가" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("INVALID_CHARACTER_NAME");
    }
  });

  it("이름이 30자 초과이면 거부한다", () => {
    const result = characterDraftSchema.safeParse({ ...validDraft, name: "가".repeat(31) });
    expect(result.success).toBe(false);
  });

  it("abilities가 3개가 아니면 거부한다", () => {
    const result = characterDraftSchema.safeParse({ ...validDraft, abilities: [validDraft.abilities[0]] });
    expect(result.success).toBe(false);
  });

  it("Bureau 공명율이 80 미만이면 거부한다", () => {
    const result = characterDraftSchema.safeParse({ ...validDraft, faction: "bureau", resonanceRate: 79 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message === "INVALID_RESONANCE_RATE")).toBe(true);
    }
  });

  it("Static 공명율이 15 이상이면 거부한다", () => {
    const result = characterDraftSchema.safeParse({ ...validDraft, faction: "static", resonanceRate: 15 });
    expect(result.success).toBe(false);
  });

  it("Static 공명율 0~14는 허용한다", () => {
    const result = characterDraftSchema.safeParse({ ...validDraft, faction: "static", resonanceRate: 10 });
    expect(result.success).toBe(true);
  });

  it("크로스오버 시 HP/WILL 코스트 둘 다 > 0 필수", () => {
    const result = characterDraftSchema.safeParse({
      ...validDraft,
      crossoverStyle: "limiter-override",
      // abilities의 costHp가 0 → 거부
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message === "INVALID_DUAL_COST")).toBe(true);
    }
  });

  it("크로스오버 + 유효 듀얼 코스트면 통과한다", () => {
    const dualCostAbilities = validDraft.abilities.map((a) => ({
      ...a,
      costHp: 10,
      costWill: 10,
    }));
    const result = characterDraftSchema.safeParse({
      ...validDraft,
      crossoverStyle: "limiter-override",
      abilities: dualCostAbilities,
    });
    expect(result.success).toBe(true);
  });

  it("능력 코스트가 99를 초과하면 거부한다", () => {
    const result = characterDraftSchema.safeParse({
      ...validDraft,
      abilities: [
        { ...validDraft.abilities[0], costHp: 100 },
        validDraft.abilities[1],
        validDraft.abilities[2],
      ],
    });
    expect(result.success).toBe(false);
  });

  it("외형/성격/배경/기타 길이 제한을 적용한다", () => {
    const result = characterDraftSchema.safeParse({
      ...validDraft,
      profileData: { ...validDraft.profileData, personality: "성".repeat(501) },
      appearance: "외".repeat(501),
      backstory: "배".repeat(1001),
      notes: "기".repeat(1001),
    });
    expect(result.success).toBe(false);
  });

  it("잘못된 faction을 거부한다", () => {
    const result = characterDraftSchema.safeParse({ ...validDraft, faction: "defector" });
    expect(result.success).toBe(false);
  });

  it("잘못된 abilityClass를 거부한다", () => {
    const result = characterDraftSchema.safeParse({ ...validDraft, abilityClass: "magic" });
    expect(result.success).toBe(false);
  });
});
