/**
 * Operation API 응답 매핑 유틸
 * - DB snake_case를 프론트 camelCase로 변환한다.
 * - 라우트 핸들러가 복잡해지지 않도록 변환 책임을 분리한다.
 */

export type DbOperationRow = {
  id: string;
  title: string;
  type: "operation" | "downtime";
  status: "waiting" | "live" | "completed";
  summary: string;
  is_main_story: boolean;
  max_participants: number;
  created_at: string;
  created_by?: string;
};

export type DbParticipantRow = {
  operation_id: string;
  team: "ally" | "enemy" | "host";
  character_id?: string;
  character?: {
    id: string;
    name: string;
    faction?: string;
    ability_class?: string | null;
    hp_current?: number;
    hp_max?: number;
    will_current?: number;
    will_max?: number;
    profile_image_url?: string | null;
  } | null;
};

export type DbMessageRow = {
  id: string;
  type: "narration" | "gm_narration" | "system" | "judgment";
  content: string;
  created_at: string;
  sender_character_id: string | null;
  sender?: {
    id: string;
    name: string;
    profile_image_url: string | null;
  } | null;
};

export function mapOperationListItem(
  operation: DbOperationRow,
  participants: DbParticipantRow[],
) {
  const teamA = participants
    .filter((item) => item.team === "ally" && item.character)
    .map((item) => ({ id: item.character!.id, name: item.character!.name }));

  const teamB = participants
    .filter((item) => item.team === "enemy" && item.character)
    .map((item) => ({ id: item.character!.id, name: item.character!.name }));

  const host =
    participants.find((item) => item.team === "host" && item.character)?.character ?? null;

  return {
    id: operation.id,
    title: operation.title,
    type: operation.type,
    status: operation.status,
    summary: operation.summary,
    isMainStory: operation.is_main_story,
    maxParticipants: operation.max_participants,
    createdAt: operation.created_at,
    teamA,
    teamB,
    host: host ? { id: host.id, name: host.name } : { id: "", name: "" },
  };
}

export function mapOperationMessage(row: DbMessageRow, myCharacterId: string | null) {
  return {
    id: row.id,
    type: row.type,
    senderId: row.sender_character_id,
    senderName: row.sender?.name ?? null,
    senderAvatarUrl: row.sender?.profile_image_url ?? null,
    content: row.content,
    timestamp: row.created_at,
    isMine: Boolean(myCharacterId && row.sender_character_id === myCharacterId),
  };
}
