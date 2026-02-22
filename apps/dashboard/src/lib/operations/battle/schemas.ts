import { z } from "zod";

export const operationActionSchema = z.object({
  ability_id: z.string().min(1).max(32),
  action_type: z.enum(["attack", "defend", "support"]),
  target_character_id: z.string().min(1).max(32).nullable().optional(),
  target_stat: z.enum(["hp", "will"]).nullable().optional(),
  base_damage: z.number().int().min(0).max(200).default(20),
  multiplier: z.number().min(0).max(3).default(1),
  narrative: z.string().trim().min(1).max(2000).optional(),
});

export const resolveTurnSchema = z.object({
  turn_id: z.string().min(1).max(32),
  idempotency_key: z.string().min(8).max(128),
  judgement: z
    .object({
      actions: z
        .array(
          z.object({
            actor_id: z.string().min(1),
            grade: z.enum(["success", "partial", "fail"]).optional(),
            multiplier: z.number().min(0).max(3).optional(),
          }),
        )
        .default([]),
    })
    .optional(),
});

export const closeEncounterSchema = z.object({
  result: z.enum(["escaped", "withdrawn", "timeout"]),
});
