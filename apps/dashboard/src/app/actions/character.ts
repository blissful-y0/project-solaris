"use server";

import { nanoid } from "nanoid";
import { createClient } from "@/lib/supabase/server";
import { FACTION_STATS, type AbilityClass, type CharacterWithAbilities, type Faction } from "@/lib/supabase/types";
import { getUserFriendlyError } from "@/lib/supabase/helpers";

interface CharacterDraft {
  name: string;
  faction: Faction;
  abilityClass: AbilityClass | null;
  profileData: {
    age?: string;
    gender?: string;
    personality?: string;
  };
  appearance?: string;
  backstory?: string;
  leaderApplication: boolean;
  abilities: {
    tier: "basic" | "mid" | "advanced";
    name: string;
    description: string;
    weakness: string;
    costAmount: number;
  }[];
}

export async function submitCharacter(draft: CharacterDraft) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }

  if (draft.abilities.length !== 3) {
    throw new Error("INVALID_ABILITIES");
  }

  const characterId = nanoid(12);
  const stats = FACTION_STATS[draft.faction];

  const abilityPayload = draft.abilities.map((ability) => ({
    id: nanoid(12),
    tier: ability.tier,
    name: ability.name,
    description: ability.description,
    weakness: ability.weakness,
    cost_type: "will",
    cost_amount: ability.costAmount,
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
    p_profile_data: draft.profileData,
    p_appearance: draft.appearance ?? null,
    p_backstory: draft.backstory ?? null,
    p_leader_application: draft.leaderApplication,
    p_abilities: abilityPayload,
  });

  if (error) {
    throw new Error(getUserFriendlyError(error));
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
    return null;
  }

  return data as CharacterWithAbilities;
}
