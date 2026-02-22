import { describe, expect, it } from "vitest";
import {
  applyActionCost,
  DAMAGE_FACTOR_BY_TIER,
  resolveTurn,
  type EncounterParticipantState,
  type ResolveTurnInput,
} from "../engine";

describe("operation engine", () => {
  it("ability 코스트(HP/WILL)를 동시에 차감한다", () => {
    const updated = applyActionCost(
      { hp: 60, will: 40 },
      { costHp: 25, costWill: 10 },
    );

    expect(updated).toEqual({ hp: 35, will: 30 });
  });

  it("ability 코스트 부족이면 에러를 던진다", () => {
    expect(() =>
      applyActionCost(
        { hp: 10, will: 5 },
        { costHp: 11, costWill: 0 },
      ),
    ).toThrow("INSUFFICIENT_COST");
  });

  it("advanced 배율은 2.0을 사용한다", () => {
    expect(DAMAGE_FACTOR_BY_TIER.advanced).toBe(2);
  });

  it("미제출자는 자동 fail 처리되고 제출자만 데미지를 적용한다", () => {
    const input: ResolveTurnInput = {
      participants: {
        A: { id: "A", hp: 80, will: 100, team: "alpha" },
        B: { id: "B", hp: 80, will: 100, team: "beta" },
      },
      actions: [
        {
          actorId: "A",
          submitted: true,
          actionType: "attack",
          tier: "advanced",
          targetId: "B",
          targetStat: "hp",
          baseDamage: 20,
          multiplier: 1,
        },
        {
          actorId: "B",
          submitted: false,
          actionType: "attack",
          tier: "basic",
          targetId: "A",
          targetStat: "hp",
          baseDamage: 20,
          multiplier: 1,
        },
      ],
    };

    const result = resolveTurn(input);

    expect(result.participants.B.hp).toBe(40);
    expect(result.participants.A.hp).toBe(80);
    expect(result.actions.find((a) => a.actorId === "B")?.grade).toBe("fail");
  });

  it("2:2에서 팀원이 서로 다른 타겟을 때리면 각각 반영된다", () => {
    const participants: Record<string, EncounterParticipantState> = {
      A1: { id: "A1", hp: 100, will: 100, team: "alpha" },
      A2: { id: "A2", hp: 100, will: 100, team: "alpha" },
      B1: { id: "B1", hp: 100, will: 100, team: "beta" },
      B2: { id: "B2", hp: 100, will: 100, team: "beta" },
    };

    const result = resolveTurn({
      participants,
      actions: [
        {
          actorId: "A1",
          submitted: true,
          actionType: "attack",
          tier: "mid",
          targetId: "B1",
          targetStat: "hp",
          baseDamage: 20,
          multiplier: 1,
        },
        {
          actorId: "A2",
          submitted: true,
          actionType: "attack",
          tier: "basic",
          targetId: "B2",
          targetStat: "will",
          baseDamage: 20,
          multiplier: 1,
        },
      ],
    });

    expect(result.participants.B1.hp).toBe(70);
    expect(result.participants.B2.will).toBe(80);
  });

  it("defend는 지정 아군이 받는 피해를 50% 감쇠한다", () => {
    const result = resolveTurn({
      participants: {
        A: { id: "A", hp: 100, will: 100, team: "alpha" },
        B: { id: "B", hp: 100, will: 100, team: "beta" },
      },
      actions: [
        {
          actorId: "A",
          submitted: true,
          actionType: "defend",
          tier: "basic",
          targetId: "A",
          targetStat: "hp",
          baseDamage: 0,
          multiplier: 1,
        },
        {
          actorId: "B",
          submitted: true,
          actionType: "attack",
          tier: "basic",
          targetId: "A",
          targetStat: "hp",
          baseDamage: 20,
          multiplier: 1,
        },
      ],
    });

    expect(result.participants.A.hp).toBe(90);
  });
});
