import type { Database } from "./database.types";

export type Tables = Database["public"]["Tables"];

export type UserRow = Tables["users"]["Row"];
export type UserInsert = Tables["users"]["Insert"];

export type CharacterRow = Tables["characters"]["Row"];
export type CharacterInsert = Tables["characters"]["Insert"];

export type AbilityRow = Tables["abilities"]["Row"];
export type AbilityInsert = Tables["abilities"]["Insert"];

export type NewsRow = Tables["news"]["Row"];
export type NewsInsert = Tables["news"]["Insert"];

export type NotificationRow = Tables["notifications"]["Row"];
export type NotificationInsert = Tables["notifications"]["Insert"];

export type CharacterWithAbilities = CharacterRow & {
  abilities: AbilityRow[];
};

export type CharacterStatus = CharacterRow["status"];
export type Faction = CharacterRow["faction"];
export type AbilityClass = NonNullable<CharacterRow["ability_class"]>;

export const FACTION_STATS: Record<Faction, { hp: number; will: number }> = {
  bureau: { hp: 80, will: 250 },
  static: { hp: 120, will: 150 },
  defector: { hp: 100, will: 200 },
};
