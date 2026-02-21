import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import {
  resolveTurn,
  type AbilityTier,
  type EncounterParticipantState,
  type TurnActionInput,
} from "@/lib/operation/engine";

type ParticipantRow = Pick<
  Database["public"]["Tables"]["operation_encounter_participants"]["Row"],
  "character_id" | "team" | "submission_order"
>;
type SubmissionRow = Database["public"]["Tables"]["operation_turn_submissions"]["Row"];

type JudgementAction = {
  actor_id: string;
  multiplier?: number;
};

export type ResolveContext = {
  participants: ParticipantRow[];
  submissions: SubmissionRow[];
  judgementActions: JudgementAction[];
};

export function buildTurnActions({
  submissions,
  judgementActions,
}: {
  submissions: SubmissionRow[];
  judgementActions: JudgementAction[];
}): TurnActionInput[] {
  const multiplierByActor = new Map(
    judgementActions.map((item) => [item.actor_id, item.multiplier]),
  );

  return submissions.map((submission) => ({
    actorId: submission.participant_character_id,
    submitted: !submission.is_auto_fail,
    actionType: submission.action_type as TurnActionInput["actionType"],
    tier: (submission.ability_tier ?? "basic") as AbilityTier,
    targetId: submission.target_character_id ?? submission.participant_character_id,
    targetStat: (submission.target_stat ?? "hp") as TurnActionInput["targetStat"],
    baseDamage: submission.base_damage,
    multiplier:
      multiplierByActor.get(submission.participant_character_id) ??
      Number(submission.multiplier ?? 1),
  }));
}

export async function computeResolution(
  supabase: SupabaseClient<Database>,
  context: ResolveContext,
) {
  const states: Record<string, EncounterParticipantState> = {};

  const participantIds = context.participants.map((p) => p.character_id);

  const { data: characterRows, error: characterError } = await supabase
    .from("characters")
    .select("id, hp_current, will_current")
    .in("id", participantIds);

  if (characterError || !characterRows) {
    throw new Error("CHARACTER_NOT_FOUND");
  }

  const characterMap = new Map(characterRows.map((c) => [c.id, c]));

  for (const participant of context.participants) {
    const data = characterMap.get(participant.character_id);
    if (!data) {
      throw new Error("CHARACTER_NOT_FOUND");
    }

    states[participant.character_id] = {
      id: participant.character_id,
      hp: data.hp_current,
      will: data.will_current,
      team: participant.team,
    };
  }

  const turnActions = buildTurnActions({
    submissions: context.submissions,
    judgementActions: context.judgementActions,
  });

  const resolved = resolveTurn({
    participants: states,
    actions: turnActions,
  });

  const effects = resolved.actions
    .filter((action) => action.actionType === "attack" && action.finalDamage > 0)
    .map((action) => ({
      source_character_id: action.actorId,
      target_character_id: action.targetId,
      target_stat: action.targetStat,
      damage: action.finalDamage,
      reason: "attack",
    }));

  return {
    resolved,
    effects,
  };
}
