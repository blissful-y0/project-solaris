export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      abilities: {
        Row: {
          character_id: string
          cost_amount: number
          cost_type: string
          created_at: string
          deleted_at: string | null
          description: string
          id: string
          name: string
          tier: string
          updated_at: string
          weakness: string | null
        }
        Insert: {
          character_id: string
          cost_amount: number
          cost_type: string
          created_at?: string
          deleted_at?: string | null
          description: string
          id: string
          name: string
          tier: string
          updated_at?: string
          weakness?: string | null
        }
        Update: {
          character_id?: string
          cost_amount?: number
          cost_type?: string
          created_at?: string
          deleted_at?: string | null
          description?: string
          id?: string
          name?: string
          tier?: string
          updated_at?: string
          weakness?: string | null
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
          appearance: string | null
          backstory: string | null
          created_at: string
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
          status: string
          updated_at: string
          user_id: string
          will_current: number
          will_max: number
        }
        Insert: {
          ability_class?: string | null
          appearance?: string | null
          backstory?: string | null
          created_at?: string
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
          status?: string
          updated_at?: string
          user_id: string
          will_current: number
          will_max: number
        }
        Update: {
          ability_class?: string | null
          appearance?: string | null
          backstory?: string | null
          created_at?: string
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
      create_character_with_abilities: {
        Args: {
          p_abilities: Json
          p_ability_class: string
          p_appearance: string
          p_backstory: string
          p_faction: string
          p_hp_current: number
          p_hp_max: number
          p_id: string
          p_leader_application: boolean
          p_name: string
          p_profile_data: Json
          p_user_id: string
          p_will_current: number
          p_will_max: number
        }
        Returns: string
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
  public: {
    Enums: {},
  },
} as const
