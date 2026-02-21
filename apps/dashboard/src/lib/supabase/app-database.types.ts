import type { Database, Json } from "./database.types";

type OperationsTable = {
  Row: {
    id: string;
    title: string;
    type: string;
    status: string;
    summary: string;
    is_main_story: boolean;
    max_participants: number;
    current_turn: number | null;
    created_by: string | null;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id: string;
    title: string;
    type: string;
    status?: string;
    summary?: string;
    is_main_story?: boolean;
    max_participants?: number;
    current_turn?: number | null;
    created_by?: string | null;
    deleted_at?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    title?: string;
    type?: string;
    status?: string;
    summary?: string;
    is_main_story?: boolean;
    max_participants?: number;
    current_turn?: number | null;
    created_by?: string | null;
    deleted_at?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Relationships: [
    {
      foreignKeyName: "operations_created_by_fkey";
      columns: ["created_by"];
      isOneToOne: false;
      referencedRelation: "characters";
      referencedColumns: ["id"];
    },
  ];
};

type OperationParticipantsTable = {
  Row: {
    id: string;
    operation_id: string;
    character_id: string;
    team: string;
    role: string;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id: string;
    operation_id: string;
    character_id: string;
    team: string;
    role?: string;
    deleted_at?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    operation_id?: string;
    character_id?: string;
    team?: string;
    role?: string;
    deleted_at?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Relationships: [
    {
      foreignKeyName: "operation_participants_operation_id_fkey";
      columns: ["operation_id"];
      isOneToOne: false;
      referencedRelation: "operations";
      referencedColumns: ["id"];
    },
    {
      foreignKeyName: "operation_participants_character_id_fkey";
      columns: ["character_id"];
      isOneToOne: false;
      referencedRelation: "characters";
      referencedColumns: ["id"];
    },
  ];
};

type OperationMessagesTable = {
  Row: {
    id: string;
    operation_id: string;
    type: string;
    sender_character_id: string | null;
    content: string;
    payload: Json | null;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id: string;
    operation_id: string;
    type: string;
    sender_character_id?: string | null;
    content?: string;
    payload?: Json | null;
    deleted_at?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    operation_id?: string;
    type?: string;
    sender_character_id?: string | null;
    content?: string;
    payload?: Json | null;
    deleted_at?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Relationships: [
    {
      foreignKeyName: "operation_messages_operation_id_fkey";
      columns: ["operation_id"];
      isOneToOne: false;
      referencedRelation: "operations";
      referencedColumns: ["id"];
    },
    {
      foreignKeyName: "operation_messages_sender_character_id_fkey";
      columns: ["sender_character_id"];
      isOneToOne: false;
      referencedRelation: "characters";
      referencedColumns: ["id"];
    },
  ];
};

export type AppDatabase = Omit<Database, "public"> & {
  public: Omit<Database["public"], "Tables"> & {
    Tables: Database["public"]["Tables"] & {
      operations: OperationsTable;
      operation_participants: OperationParticipantsTable;
      operation_messages: OperationMessagesTable;
    };
  };
};
