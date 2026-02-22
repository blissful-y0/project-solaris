export type AbilityTier = "basic" | "mid" | "advanced";
export type ActionType = "attack" | "defend" | "support";
export type TargetStat = "hp" | "will";
export type ActionGrade = "success" | "partial" | "fail";

export type EncounterParticipantState = {
  id: string;
  team: string;
  hp: number;
  will: number;
};

export type TurnActionInput = {
  actorId: string;
  submitted: boolean;
  actionType: ActionType;
  tier: AbilityTier;
  targetId: string;
  targetStat: TargetStat;
  baseDamage: number;
  multiplier: number;
};

export type ResolveTurnInput = {
  participants: Record<string, EncounterParticipantState>;
  actions: TurnActionInput[];
};

export type ResolveTurnOutput = {
  participants: Record<string, EncounterParticipantState>;
  actions: Array<
    TurnActionInput & {
      grade: ActionGrade;
      finalDamage: number;
    }
  >;
};

export const DAMAGE_FACTOR_BY_TIER: Record<AbilityTier, number> = {
  basic: 1,
  mid: 1.5,
  advanced: 2,
};

export function applyActionCost(
  current: { hp: number; will: number },
  cost: { costHp: number; costWill: number },
): { hp: number; will: number } {
  if (current.hp < cost.costHp || current.will < cost.costWill) {
    throw new Error("INSUFFICIENT_COST");
  }

  return {
    hp: Math.max(0, current.hp - cost.costHp),
    will: Math.max(0, current.will - cost.costWill),
  };
}

export function resolveTurn(input: ResolveTurnInput): ResolveTurnOutput {
  const participants = structuredClone(input.participants);
  const guardMap = new Map<string, number>();
  const supportMap = new Map<string, number>();

  for (const action of input.actions) {
    if (!action.submitted) continue;
    if (action.actionType === "defend") {
      guardMap.set(action.targetId, 0.5);
    }
    if (action.actionType === "support") {
      supportMap.set(action.targetId, 0.25);
    }
  }

  const resolvedActions = input.actions.map((action) => {
    if (!action.submitted) {
      return {
        ...action,
        grade: "fail" as const,
        finalDamage: 0,
      };
    }

    const tierFactor = DAMAGE_FACTOR_BY_TIER[action.tier];
    let finalDamage = Math.floor(
      action.baseDamage * tierFactor * Math.max(0, action.multiplier),
    );

    if (action.actionType === "attack") {
      finalDamage = Math.floor(
        finalDamage * (1 + (supportMap.get(action.actorId) ?? 0)),
      );
      finalDamage = Math.floor(
        finalDamage * (guardMap.get(action.targetId) ?? 1),
      );
      const target = participants[action.targetId];
      if (target) {
        if (action.targetStat === "hp") {
          target.hp = Math.max(0, target.hp - finalDamage);
        } else {
          target.will = Math.max(0, target.will - finalDamage);
        }
      }
    }

    const grade: ActionGrade =
      finalDamage > 0 ? (action.multiplier < 1 ? "partial" : "success") : "fail";

    return {
      ...action,
      grade,
      finalDamage,
    };
  });

  return {
    participants,
    actions: resolvedActions,
  };
}
