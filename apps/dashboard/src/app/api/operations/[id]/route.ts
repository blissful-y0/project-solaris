import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { mapOperationMessage, type DbMessageRow } from "@/lib/operations/dto";

type OperationDetailRow = {
  id: string;
  title: string;
  type: string;
  status: string;
  summary: string;
  is_main_story: boolean;
  max_participants: number;
  created_at: string;
};

type OperationDetailParticipantRow = {
  character_id: string;
  team: "bureau" | "static" | "defector";
  character: {
    id: string;
    name: string;
    faction: string;
    ability_class: string | null;
    hp_current: number;
    hp_max: number;
    will_current: number;
    will_max: number;
    profile_image_url: string | null;
    abilities: Array<{
      id: string;
      name: string;
      tier: string;
      cost_hp: number;
      cost_will: number;
    }> | null;
  } | null;
};

/**
 * GET /api/operations/[id]
 *
 * Phase 1(Downtime) 진입 API.
 * - 상세 메타 + 참가자 + 메시지 로그를 한 번에 내려준다.
 * - 프론트가 추가 조인 요청 없이 방을 바로 렌더링할 수 있게 구성한다.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }

    const { data: operation, error: operationError } = await supabase
      .from("operations")
      .select("id, title, type, status, summary, is_main_story, max_participants, created_at")
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle();

    if (operationError) {
      console.error("[api/operations/[id]] 상세 조회 실패:", operationError.message);
      return NextResponse.json({ error: "FAILED_TO_FETCH_OPERATION" }, { status: 500 });
    }

    if (!operation) {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }

    const { data: myCharacter } = await supabase
      .from("characters")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "approved")
      .is("deleted_at", null)
      .maybeSingle();

    const myCharacterId: string | null = myCharacter?.id ?? null;

    const { data: participants, error: participantsError } = await supabase
      .from("operation_participants")
      .select(
        "character_id, team, character:characters(id, name, faction, ability_class, hp_current, hp_max, will_current, will_max, profile_image_url, abilities(id, name, tier, cost_hp, cost_will))",
      )
      .eq("operation_id", id)
      .is("deleted_at", null);

    if (participantsError) {
      console.error("[api/operations/[id]] 참가자 조회 실패:", participantsError.message);
      return NextResponse.json(
        { error: "FAILED_TO_FETCH_OPERATION_PARTICIPANTS" },
        { status: 500 },
      );
    }

    const { data: messages, error: messagesError } = await supabase
      .from("operation_messages")
      .select("id, type, content, created_at, sender_character_id, sender:characters(id, name, profile_image_url)")
      .eq("operation_id", id)
      .is("deleted_at", null)
      .order("created_at", { ascending: true });

    if (messagesError) {
      console.error("[api/operations/[id]] 메시지 조회 실패:", messagesError.message);
      return NextResponse.json({ error: "FAILED_TO_FETCH_MESSAGES" }, { status: 500 });
    }

    const participantRows = (participants ?? []) as OperationDetailParticipantRow[];
    const normalizedParticipants = participantRows
      .filter((item) => item.character)
      .map((item) => ({
        id: item.character.id,
        name: item.character.name,
        faction: item.character.faction,
        team: item.team,
        hp: {
          current: item.character.hp_current,
          max: item.character.hp_max,
        },
        will: {
          current: item.character.will_current,
          max: item.character.will_max,
        },
        abilities: (item.character.abilities ?? []).map((a) => ({
          id: a.id,
          name: a.name,
          tier: a.tier,
          costHp: a.cost_hp,
          costWill: a.cost_will,
        })),
        avatarUrl: item.character.profile_image_url,
      }));

    const mappedMessages = ((messages ?? []) as DbMessageRow[]).map((row) =>
      mapOperationMessage(row, myCharacterId),
    );

    const operationRow = operation as OperationDetailRow;

    return NextResponse.json({
      data: {
        id: operationRow.id,
        title: operationRow.title,
        type: operationRow.type,
        status: operationRow.status,
        summary: operationRow.summary,
        isMainStory: operationRow.is_main_story,
        maxParticipants: operationRow.max_participants,
        createdAt: operationRow.created_at,
        myParticipantId: myCharacterId,
        participants: normalizedParticipants,
        messages: mappedMessages,
      },
    });
  } catch (error) {
    console.error("[api/operations/[id]] unexpected error:", error);
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
