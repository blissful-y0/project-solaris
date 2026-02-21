"use server";

import { nanoid } from "nanoid";
import { createClient } from "@/lib/supabase/server";
import { FACTION_STATS, type AbilityClass, type CharacterWithAbilities, type Faction } from "@/lib/supabase/types";
import { getUserFriendlyError } from "@/lib/supabase/helpers";
import { getServiceClient } from "@/lib/supabase/service";
import { createNotification } from "@/app/actions/notification";

interface CharacterDraft {
  name: string;
  faction: Faction;
  abilityClass: AbilityClass | null;
  resonanceRate: number;
  profileData: {
    age?: string;
    gender?: string;
    personality?: string;
  };
  profileImageUrl?: string;
  appearance?: string;
  backstory?: string;
  leaderApplication: boolean;
  crossoverStyle?: "limiter-override" | "hardware-bypass" | "dead-reckoning" | "defector" | null;
  abilities: {
    tier: "basic" | "mid" | "advanced";
    name: string;
    description: string;
    weakness: string;
    costHp: number;
    costWill: number;
  }[];
}

function validateDraft(draft: CharacterDraft) {
  const normalizedName = draft.name.trim();
  if (normalizedName.length < 2 || normalizedName.length > 30) {
    throw new Error("INVALID_CHARACTER_NAME");
  }

  for (const ability of draft.abilities) {
    if (ability.name.trim().length < 1 || ability.name.trim().length > 40) {
      throw new Error("INVALID_ABILITY_NAME");
    }
    if (ability.description.trim().length < 1 || ability.description.trim().length > 500) {
      throw new Error("INVALID_ABILITY_DESCRIPTION");
    }
  }
}

export async function submitCharacter(draft: CharacterDraft) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }

  validateDraft(draft);

  if (draft.abilities.length !== 3) {
    throw new Error("INVALID_ABILITIES");
  }

  if (draft.faction === "bureau" && draft.resonanceRate < 80) {
    throw new Error("INVALID_RESONANCE_RATE");
  }

  if (draft.faction === "static" && draft.resonanceRate > 15) {
    throw new Error("INVALID_RESONANCE_RATE");
  }

  if (draft.crossoverStyle) {
    const hasInvalidDualCost = draft.abilities.some(
      (ability) => ability.costHp <= 0 || ability.costWill <= 0,
    );
    if (hasInvalidDualCost) {
      throw new Error("INVALID_DUAL_COST");
    }
  }

  const characterId = nanoid(12);
  const stats = FACTION_STATS[draft.faction];

  const abilityPayload = draft.abilities.map((ability) => ({
    id: nanoid(12),
    tier: ability.tier,
    name: ability.name,
    description: ability.description,
    weakness: ability.weakness,
    cost_hp: ability.costHp,
    cost_will: ability.costWill,
  }));

  const { data, error } = await supabase.rpc("create_character_with_abilities", {
    p_id: characterId,
    p_user_id: user.id,
    p_name: draft.name,
    p_faction: draft.faction,
    p_ability_class: draft.abilityClass,
    p_hp_max: stats.hp,
    p_hp_current: stats.hp,
    p_will_max: stats.will,
    p_will_current: stats.will,
    p_resonance_rate: draft.resonanceRate,
    p_profile_image_url: draft.profileImageUrl ?? null,
    p_profile_data: draft.profileData,
    p_appearance: draft.appearance ?? null,
    p_backstory: draft.backstory ?? null,
    p_leader_application: draft.leaderApplication,
    p_crossover_style: draft.crossoverStyle ?? null,
    p_abilities: abilityPayload,
  });

  if (error) {
    throw new Error(getUserFriendlyError(error));
  }

  // 어드민 웹훅 알림 (실패해도 캐릭터 생성은 성공으로 처리)
  try {
    const { data: userRow } = await supabase
      .from("users")
      .select("discord_username")
      .eq("id", user.id)
      .single();

    const factionLabel: Record<string, string> = {
      bureau: "보안국",
      static: "The Static",
      defector: "전향자",
    };

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
    const adminUrl = `${appUrl}/admin/characters/${characterId}`;

    await createNotification({
      userId: null,
      scope: "broadcast",
      type: "character_pending",
      title: "[캐릭터 신청] 새 신청서 접수",
      body: [
        `이름: **${draft.name}** | 진영: ${factionLabel[draft.faction] ?? draft.faction}`,
        `신청자: @${userRow?.discord_username ?? "unknown"}`,
        adminUrl ? `심사: ${adminUrl}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
      channel: "discord_webhook",
    }, getServiceClient());
  } catch (notifError) {
    console.error("[submitCharacter] 어드민 웹훅 알림 실패 (캐릭터 생성 완료):", notifError);
  }

  // 신청자 본인에게 DM 알림 (실패해도 캐릭터 생성은 성공으로 처리)
  try {
    await createNotification(
      {
        userId: user.id,
        scope: "user",
        type: "character_submitted",
        channel: "discord_dm",
        title: "[SOLARIS] 캐릭터 신청 완료",
        body: `캐릭터 **${draft.name}** 신청이 접수되었습니다.\n심사 후 결과를 알려드리겠습니다.`,
        payload: { characterId },
      },
      getServiceClient(),
    );
  } catch (dmError) {
    console.error("[submitCharacter] 신청자 DM 알림 실패 (캐릭터 생성 완료):", dmError);
  }

  return { characterId: (data as string | null) ?? characterId };
}

export async function cancelCharacter() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }

  const { data: character, error: characterError } = await supabase
    .from("characters")
    .select("id, status")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .single();

  if (characterError || !character) {
    throw new Error("CHARACTER_NOT_FOUND");
  }

  if (character.status !== "pending" && character.status !== "rejected") {
    throw new Error("CANNOT_CANCEL_CHARACTER");
  }

  const { error: deleteError } = await supabase
    .from("characters")
    // 기획 확정: pending/rejected는 신청 취소 시 재작성 가능하도록 hard delete 처리
    .delete()
    .eq("id", character.id)
    .eq("user_id", user.id);

  if (deleteError) {
    throw new Error(getUserFriendlyError(deleteError));
  }
}

export async function getMyCharacter(): Promise<CharacterWithAbilities | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("characters")
    .select("*, abilities(*)")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(getUserFriendlyError(error));
  }

  return data as CharacterWithAbilities;
}
