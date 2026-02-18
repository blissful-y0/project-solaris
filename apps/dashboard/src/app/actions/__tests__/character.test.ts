import { describe, expect, it } from "vitest";

import { submitCharacter } from "../character";

describe("character server action stub", () => {
  it("이름이 비어 있으면 거부한다", async () => {
    await expect(
      submitCharacter({
        name: " ",
        faction: "bureau",
        abilityClass: "field",
        resonanceRate: 80,
        profileData: {},
        abilities: [
          {
            tier: "basic",
            name: "기본",
            description: "설명",
            weakness: "약점",
            costHp: 0,
            costWill: 10,
          },
        ],
        leaderApplication: false,
      }),
    ).rejects.toThrow("INVALID_CHARACTER_NAME");
  });
});
