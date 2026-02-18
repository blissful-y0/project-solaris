"use server";

import { z } from "zod";

/**
 * 캐릭터 제출 Server Action — 스텁
 * 백엔드 통합 전까지 프론트엔드 빌드용 placeholder.
 * 실제 구현은 feat/phase2-backend 브랜치에 있음.
 */
export async function submitCharacter(draft: {
  name: string;
  faction: string;
  abilityClass: string | null;
  resonanceRate: number;
  profileData: Record<string, string | undefined>;
  profileImageUrl?: string;
  appearance?: string;
  backstory?: string;
  leaderApplication: boolean;
  crossoverStyle?: string | null;
  abilities: {
    tier: string;
    name: string;
    description: string;
    weakness: string;
    costHp: number;
    costWill: number;
  }[];
}): Promise<{ characterId: string }> {
  const schema = z.object({
    name: z.string().trim().min(1, "INVALID_CHARACTER_NAME"),
    abilities: z.array(
      z.object({
        name: z.string().trim().min(1, "INVALID_ABILITY_NAME"),
        description: z.string().trim().min(1, "INVALID_ABILITY_DESCRIPTION"),
      }),
    ).min(1, "INVALID_ABILITIES"),
  });
  const parsed = schema.safeParse(draft);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "INVALID_INPUT");
  }

  // 스텁 — 통합 빌드에서 백엔드 구현으로 덮어씌워짐
  return { characterId: "stub-" + Date.now() };
}

/**
 * 캐릭터 취소 Server Action — 스텁
 */
export async function cancelCharacter(): Promise<void> {
  return;
}

/**
 * 내 캐릭터 조회 Server Action — 스텁
 */
export async function getMyCharacter(): Promise<null> {
  return null;
}
