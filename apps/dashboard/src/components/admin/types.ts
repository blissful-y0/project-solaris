export type AdminAbility = {
  id: string;
  tier: "basic" | "mid" | "advanced";
  name: string;
  description: string;
  weakness: string | null;
  cost_hp: number;
  cost_will: number;
};

export type AdminCharacter = {
  id: string;
  user_id: string;
  name: string;
  faction: "bureau" | "static" | "defector";
  ability_class: string | null;
  status: "pending" | "approved" | "rejected";
  resonance_rate: number;
  leader_application: boolean;
  is_leader: boolean;
  profile_image_url: string | null;
  appearance: string | null;
  backstory: string | null;
  profile_data: {
    age?: string;
    gender?: string;
    personality?: string;
  } | null;
  hp_max: number;
  hp_current: number;
  will_max: number;
  will_current: number;
  crossover_style: string | null;
  created_at?: string;
  abilities: AdminAbility[];
};
