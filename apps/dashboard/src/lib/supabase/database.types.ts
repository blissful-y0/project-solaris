export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      abilities: {
        Row: {
          character_id: string
          cost_hp: number
          cost_will: number
          created_at: string
          deleted_at: string | null
          description: string
          id: string
          name: string
          tier: string
          updated_at: string
        }
        Insert: {
          character_id: string
          cost_hp?: number
          cost_will?: number
          created_at?: string
          deleted_at?: string | null
          description: string
          id: string
          name: string
          tier: string
          updated_at?: string
        }
        Update: {
          character_id?: string
          cost_hp?: number
          cost_will?: number
          created_at?: string
          deleted_at?: string | null
          description?: string
          id?: string
          name?: string
          tier?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "abilities_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      characters: {
        Row: {
          ability_class: string | null
          ability_description: string | null
          ability_name: string | null
          ability_weakness: string | null
          appearance: string | null
          backstory: string | null
          created_at: string
          crossover_style: string | null
          deleted_at: string | null
          faction: string
          hp_current: number
          hp_max: number
          id: string
          is_leader: boolean
          leader_application: boolean
          name: string
          profile_data: Json | null
          profile_image_url: string | null
          rejection_reason: string | null
          resonance_rate: number
          status: string
          updated_at: string
          user_id: string
          will_current: number
          will_max: number
        }
        Insert: {
          ability_class?: string | null
          ability_description?: string | null
          ability_name?: string | null
          ability_weakness?: string | null
          appearance?: string | null
          backstory?: string | null
          created_at?: string
          crossover_style?: string | null
          deleted_at?: string | null
          faction: string
          hp_current: number
          hp_max: number
          id: string
          is_leader?: boolean
          leader_application?: boolean
          name: string
          profile_data?: Json | null
          profile_image_url?: string | null
          rejection_reason?: string | null
          resonance_rate?: number
          status?: string
          updated_at?: string
          user_id: string
          will_current: number
          will_max: number
        }
        Update: {
          ability_class?: string | null
          ability_description?: string | null
          ability_name?: string | null
          ability_weakness?: string | null
          appearance?: string | null
          backstory?: string | null
          created_at?: string
          crossover_style?: string | null
          deleted_at?: string | null
          faction?: string
          hp_current?: number
          hp_max?: number
          id?: string
          is_leader?: boolean
          leader_application?: boolean
          name?: string
          profile_data?: Json | null
          profile_image_url?: string | null
          rejection_reason?: string | null
          resonance_rate?: number
          status?: string
          updated_at?: string
          user_id?: string
          will_current?: number
          will_max?: number
        }
        Relationships: [
          {
            foreignKeyName: "characters_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      civilian_merits: {
        Row: {
          created_at: string
          deleted_at: string | null
          description: string
          effect: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          description: string
          effect: string
          id: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          description?: string
          effect?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      lore_request_segments: {
        Row: {
          created_at: string
          deleted_at: string | null
          end_offset: number | null
          id: string
          lore_request_id: string
          message_id: string
          operation_id: string
          order_index: number
          selected_text: string
          start_offset: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          end_offset?: number | null
          id: string
          lore_request_id: string
          message_id: string
          operation_id: string
          order_index: number
          selected_text: string
          start_offset?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          end_offset?: number | null
          id?: string
          lore_request_id?: string
          message_id?: string
          operation_id?: string
          order_index?: number
          selected_text?: string
          start_offset?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lore_request_segments_lore_request_id_fkey"
            columns: ["lore_request_id"]
            isOneToOne: false
            referencedRelation: "lore_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lore_request_segments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "operation_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lore_request_segments_operation_id_fkey"
            columns: ["operation_id"]
            isOneToOne: false
            referencedRelation: "operations"
            referencedColumns: ["id"]
          },
        ]
      }
      lore_request_votes: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          lore_request_id: string
          operation_id: string
          updated_at: string
          vote: string
          voter_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id: string
          lore_request_id: string
          operation_id: string
          updated_at?: string
          vote: string
          voter_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          lore_request_id?: string
          operation_id?: string
          updated_at?: string
          vote?: string
          voter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lore_request_votes_lore_request_id_fkey"
            columns: ["lore_request_id"]
            isOneToOne: false
            referencedRelation: "lore_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lore_request_votes_operation_id_fkey"
            columns: ["operation_id"]
            isOneToOne: false
            referencedRelation: "operations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lore_request_votes_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      lore_requests: {
        Row: {
          ai_summary: string | null
          created_at: string
          deleted_at: string | null
          id: string
          operation_id: string
          range_end_message_id: string
          range_start_message_id: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          ai_summary?: string | null
          created_at?: string
          deleted_at?: string | null
          id: string
          operation_id: string
          range_end_message_id: string
          range_start_message_id: string
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          ai_summary?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          operation_id?: string
          range_end_message_id?: string
          range_start_message_id?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lore_requests_operation_id_fkey"
            columns: ["operation_id"]
            isOneToOne: false
            referencedRelation: "operations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lore_requests_range_end_message_id_fkey"
            columns: ["range_end_message_id"]
            isOneToOne: false
            referencedRelation: "operation_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lore_requests_range_start_message_id_fkey"
            columns: ["range_start_message_id"]
            isOneToOne: false
            referencedRelation: "operation_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lore_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          bulletin_number: number | null
          category: string | null
          content: string
          created_at: string
          deleted_at: string | null
          id: string
          source_type: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          bulletin_number?: number | null
          category?: string | null
          content: string
          created_at?: string
          deleted_at?: string | null
          id: string
          source_type: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          bulletin_number?: number | null
          category?: string | null
          content?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          source_type?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      news_reactions: {
        Row: {
          created_at: string
          deleted_at: string | null
          emoji: string
          id: string
          news_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          emoji: string
          id: string
          news_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          emoji?: string
          id?: string
          news_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_reactions_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          channel: string
          created_at: string
          delivery_attempts: number
          delivery_status: string
          id: string
          last_error: string | null
          payload: Json
          read_at: string | null
          scope: string
          title: string
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          body: string
          channel: string
          created_at?: string
          delivery_attempts?: number
          delivery_status?: string
          id: string
          last_error?: string | null
          payload?: Json
          read_at?: string | null
          scope: string
          title: string
          type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          body?: string
          channel?: string
          created_at?: string
          delivery_attempts?: number
          delivery_status?: string
          id?: string
          last_error?: string | null
          payload?: Json
          read_at?: string | null
          scope?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      operation_encounter_participants: {
        Row: {
          character_id: string
          created_at: string
          encounter_id: string
          id: number
          is_active: boolean
          submission_order: number
          team: string
        }
        Insert: {
          character_id: string
          created_at?: string
          encounter_id: string
          id?: number
          is_active?: boolean
          submission_order: number
          team: string
        }
        Update: {
          character_id?: string
          created_at?: string
          encounter_id?: string
          id?: number
          is_active?: boolean
          submission_order?: number
          team?: string
        }
        Relationships: [
          {
            foreignKeyName: "operation_encounter_participants_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operation_encounter_participants_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "operation_encounters"
            referencedColumns: ["id"]
          },
        ]
      }
      operation_encounters: {
        Row: {
          created_at: string
          created_by: string
          current_turn: number
          deleted_at: string | null
          ended_at: string | null
          gm_closed_by: string | null
          id: string
          result: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          current_turn?: number
          deleted_at?: string | null
          ended_at?: string | null
          gm_closed_by?: string | null
          id: string
          result?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          current_turn?: number
          deleted_at?: string | null
          ended_at?: string | null
          gm_closed_by?: string | null
          id?: string
          result?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "operation_encounters_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operation_encounters_gm_closed_by_fkey"
            columns: ["gm_closed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      operation_messages: {
        Row: {
          content: string
          created_at: string
          deleted_at: string | null
          id: string
          operation_id: string
          payload: Json | null
          sender_character_id: string | null
          type: string
          updated_at: string
        }
        Insert: {
          content?: string
          created_at?: string
          deleted_at?: string | null
          id: string
          operation_id: string
          payload?: Json | null
          sender_character_id?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          operation_id?: string
          payload?: Json | null
          sender_character_id?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "operation_messages_operation_id_fkey"
            columns: ["operation_id"]
            isOneToOne: false
            referencedRelation: "operations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operation_messages_sender_character_id_fkey"
            columns: ["sender_character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      operation_participants: {
        Row: {
          character_id: string
          created_at: string
          deleted_at: string | null
          id: string
          operation_id: string
          role: string
          team: string
          updated_at: string
        }
        Insert: {
          character_id: string
          created_at?: string
          deleted_at?: string | null
          id: string
          operation_id: string
          role?: string
          team: string
          updated_at?: string
        }
        Update: {
          character_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          operation_id?: string
          role?: string
          team?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "operation_participants_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operation_participants_operation_id_fkey"
            columns: ["operation_id"]
            isOneToOne: false
            referencedRelation: "operations"
            referencedColumns: ["id"]
          },
        ]
      }
      operation_turn_effects: {
        Row: {
          created_at: string
          delta: number
          id: number
          reason: string
          source_character_id: string | null
          target_character_id: string
          target_stat: string
          turn_id: string
        }
        Insert: {
          created_at?: string
          delta: number
          id?: number
          reason: string
          source_character_id?: string | null
          target_character_id: string
          target_stat: string
          turn_id: string
        }
        Update: {
          created_at?: string
          delta?: number
          id?: number
          reason?: string
          source_character_id?: string | null
          target_character_id?: string
          target_stat?: string
          turn_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "operation_turn_effects_source_character_id_fkey"
            columns: ["source_character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operation_turn_effects_target_character_id_fkey"
            columns: ["target_character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operation_turn_effects_turn_id_fkey"
            columns: ["turn_id"]
            isOneToOne: false
            referencedRelation: "operation_turns"
            referencedColumns: ["id"]
          },
        ]
      }
      operation_turn_submissions: {
        Row: {
          ability_id: string | null
          ability_tier: string | null
          action_type: string
          base_damage: number
          cost_hp: number
          cost_will: number
          created_at: string
          id: string
          is_auto_fail: boolean
          multiplier: number
          narrative: string | null
          participant_character_id: string
          submitted_at: string
          target_character_id: string | null
          target_stat: string | null
          turn_id: string
          updated_at: string
        }
        Insert: {
          ability_id?: string | null
          ability_tier?: string | null
          action_type: string
          base_damage?: number
          cost_hp?: number
          cost_will?: number
          created_at?: string
          id: string
          is_auto_fail?: boolean
          multiplier?: number
          narrative?: string | null
          participant_character_id: string
          submitted_at?: string
          target_character_id?: string | null
          target_stat?: string | null
          turn_id: string
          updated_at?: string
        }
        Update: {
          ability_id?: string | null
          ability_tier?: string | null
          action_type?: string
          base_damage?: number
          cost_hp?: number
          cost_will?: number
          created_at?: string
          id?: string
          is_auto_fail?: boolean
          multiplier?: number
          narrative?: string | null
          participant_character_id?: string
          submitted_at?: string
          target_character_id?: string | null
          target_stat?: string | null
          turn_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "operation_turn_submissions_ability_id_fkey"
            columns: ["ability_id"]
            isOneToOne: false
            referencedRelation: "abilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operation_turn_submissions_participant_character_id_fkey"
            columns: ["participant_character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operation_turn_submissions_target_character_id_fkey"
            columns: ["target_character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operation_turn_submissions_turn_id_fkey"
            columns: ["turn_id"]
            isOneToOne: false
            referencedRelation: "operation_turns"
            referencedColumns: ["id"]
          },
        ]
      }
      operation_turns: {
        Row: {
          action_results: Json | null
          created_at: string
          deleted_at: string | null
          encounter_id: string
          execution_summary: Json | null
          id: string
          judgement: Json | null
          resolution_idempotency_key: string | null
          resolved_at: string | null
          status: string
          turn_number: number
          updated_at: string
        }
        Insert: {
          action_results?: Json | null
          created_at?: string
          deleted_at?: string | null
          encounter_id: string
          execution_summary?: Json | null
          id: string
          judgement?: Json | null
          resolution_idempotency_key?: string | null
          resolved_at?: string | null
          status?: string
          turn_number: number
          updated_at?: string
        }
        Update: {
          action_results?: Json | null
          created_at?: string
          deleted_at?: string | null
          encounter_id?: string
          execution_summary?: Json | null
          id?: string
          judgement?: Json | null
          resolution_idempotency_key?: string | null
          resolved_at?: string | null
          status?: string
          turn_number?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "operation_turns_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "operation_encounters"
            referencedColumns: ["id"]
          },
        ]
      }
      operations: {
        Row: {
          created_at: string
          created_by: string | null
          current_turn: number | null
          deleted_at: string | null
          id: string
          is_main_story: boolean
          max_participants: number
          status: string
          summary: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          current_turn?: number | null
          deleted_at?: string | null
          id: string
          is_main_story?: boolean
          max_participants?: number
          status?: string
          summary?: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          current_turn?: number | null
          deleted_at?: string | null
          id?: string
          is_main_story?: boolean
          max_participants?: number
          status?: string
          summary?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "operations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          ai_model_routing: Json
          battle_settings: Json
          character_settings: Json
          created_at: string
          deleted_at: string | null
          gm_bias: Json
          id: string
          lore_settings: Json
          season: Json
          updated_at: string
        }
        Insert: {
          ai_model_routing?: Json
          battle_settings?: Json
          character_settings?: Json
          created_at?: string
          deleted_at?: string | null
          gm_bias?: Json
          id?: string
          lore_settings?: Json
          season?: Json
          updated_at?: string
        }
        Update: {
          ai_model_routing?: Json
          battle_settings?: Json
          character_settings?: Json
          created_at?: string
          deleted_at?: string | null
          gm_bias?: Json
          id?: string
          lore_settings?: Json
          season?: Json
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          deleted_at: string | null
          discord_id: string
          discord_username: string
          id: string
          notification_settings: Json
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          discord_id: string
          discord_username: string
          id: string
          notification_settings?: Json
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          discord_id?: string
          discord_username?: string
          id?: string
          notification_settings?: Json
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_operation_resolution: {
        Args: {
          p_action_results: Json
          p_close_result?: string
          p_closed_by?: string
          p_effects: Json
          p_execution_summary: Json
          p_idempotency_key: string
          p_turn_id: string
        }
        Returns: Json
      }
      create_character_with_abilities: {
        Args: {
          p_abilities: Json
          p_ability_class: string
          p_ability_description: string
          p_ability_name: string
          p_ability_weakness: string
          p_appearance: string
          p_backstory: string
          p_crossover_style: string
          p_faction: string
          p_hp_current: number
          p_hp_max: number
          p_id: string
          p_leader_application: boolean
          p_name: string
          p_notes: string
          p_profile_data: Json
          p_profile_image_url: string
          p_resonance_rate: number
          p_user_id: string
          p_will_current: number
          p_will_max: number
        }
        Returns: string
      }
      is_admin: { Args: { p_user_id?: string }; Returns: boolean }
      submit_operation_action: {
        Args: {
          p_ability_id: string
          p_action_type: string
          p_base_damage: number
          p_encounter_id: string
          p_multiplier: number
          p_narrative: string
          p_target_character_id: string
          p_target_stat: string
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

