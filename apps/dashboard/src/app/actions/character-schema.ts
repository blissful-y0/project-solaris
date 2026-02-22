import { z } from "zod";

const abilitySchema = z.object({
  tier: z.enum(["basic", "mid", "advanced"]),
  name: z.string().trim().min(1, "INVALID_ABILITY_NAME").max(40, "INVALID_ABILITY_NAME"),
  description: z.string().trim().min(1, "INVALID_ABILITY_DESCRIPTION").max(500, "INVALID_ABILITY_DESCRIPTION"),
  costHp: z.number().int().min(0).max(99, "INVALID_ABILITY_COST"),
  costWill: z.number().int().min(0).max(99, "INVALID_ABILITY_COST"),
});

export const characterDraftSchema = z.object({
  name: z.string().trim().min(2, "INVALID_CHARACTER_NAME").max(30, "INVALID_CHARACTER_NAME"),
  faction: z.enum(["bureau", "static"]),
  abilityClass: z.enum(["field", "empathy", "shift", "compute"]),
  resonanceRate: z.number().int().min(0).max(100),
  abilityName: z.string().trim().max(40).optional(),
  abilityDescription: z.string().trim().max(500).optional(),
  abilityWeakness: z.string().trim().max(1000).optional(),
  profileData: z.object({
    age: z.string().optional(),
    gender: z.string().optional(),
    personality: z.string().max(500, "INVALID_PROFILE_DATA").optional(),
  }),
  profileImageUrl: z.union([z.string().url(), z.literal("")]).optional(),
  appearance: z.string().max(500, "INVALID_APPEARANCE").optional(),
  backstory: z.string().max(1000, "INVALID_BACKSTORY").optional(),
  notes: z.string().max(1000, "INVALID_NOTES").optional(),
  leaderApplication: z.boolean(),
  crossoverStyle: z.enum(["limiter-override", "hardware-bypass", "dead-reckoning", "defector"]).nullable().optional(),
  abilities: z.array(abilitySchema).length(3, "INVALID_ABILITIES"),
}).superRefine((data, ctx) => {
  // Bureau 공명율: 80~100
  if (data.faction === "bureau" && data.resonanceRate < 80) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "INVALID_RESONANCE_RATE",
      path: ["resonanceRate"],
    });
  }

  // Static 공명율: 0~14
  if (data.faction === "static" && data.resonanceRate > 14) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "INVALID_RESONANCE_RATE",
      path: ["resonanceRate"],
    });
  }

  // 크로스오버 시 모든 능력의 HP/WILL 코스트 > 0 필수
  if (data.crossoverStyle) {
    const hasInvalidDualCost = data.abilities.some(
      (ability) => ability.costHp <= 0 || ability.costWill <= 0,
    );
    if (hasInvalidDualCost) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "INVALID_DUAL_COST",
        path: ["abilities"],
      });
    }
  }
});

export type ValidatedCharacterDraft = z.infer<typeof characterDraftSchema>;
