import { describe, expect, it, vi } from "vitest";

import { toCharacterSummary, toRegistryCharacter } from "../registry-data";

describe("registry-data mappers", () => {
  it("toCharacterSummary는 알 수 없는 faction을 안전한 값으로 보정한다", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = toCharacterSummary({
      id: "c1",
      is_mine: true,
      name: "테스트",
      faction: "unknown-faction",
      ability_class: "field",
      profile_image_url: null,
      is_leader: false,
    });

    expect(result.faction).toBe("defector");
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("toRegistryCharacter는 cost_hp/cost_will을 그대로 매핑한다", () => {
    const result = toRegistryCharacter({
      id: "c1",
      is_mine: true,
      name: "테스트",
      faction: "bureau",
      ability_class: "field",
      hp_max: 80,
      hp_current: 80,
      will_max: 250,
      will_current: 250,
      appearance: null,
      backstory: null,
      profile_image_url: null,
      is_leader: false,
      resonance_rate: 80,
      abilities: [
        {
          tier: "advanced",
          name: "하모닉스",
          description: "설명",
          weakness: "약점",
          cost_hp: 10,
          cost_will: 20,
        },
      ],
    });

    expect(result.abilities[0]).toEqual(
      expect.objectContaining({
        costHp: 10,
        costWill: 20,
      }),
    );
    expect(result.isMine).toBe(true);
  });
});
