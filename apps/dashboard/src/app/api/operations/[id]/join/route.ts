import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function isDuplicateKeyError(error: unknown) {
  const code = (error as { code?: string } | null)?.code;
  return code === "23505";
}

function isMissingJoinRpcFunction(error: unknown) {
  const code = (error as { code?: string } | null)?.code;
  const message = (error as { message?: string } | null)?.message ?? "";
  return code === "42883" && /join_operation_participant/i.test(message);
}

function mapJoinRpcError(message: string): { code: string; status: number } {
  if (message.includes("NOT_FOUND")) return { code: "NOT_FOUND", status: 404 };
  if (message.includes("OPERATION_CLOSED")) return { code: "OPERATION_CLOSED", status: 409 };
  if (message.includes("OPERATION_FULL")) return { code: "OPERATION_FULL", status: 409 };
  if (message.includes("FORBIDDEN")) return { code: "FORBIDDEN", status: 403 };
  return { code: "FAILED_TO_JOIN_OPERATION", status: 500 };
}

async function joinWithLegacyInsert({
  supabase,
  operationId,
  characterId,
  team,
}: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  operationId: string;
  characterId: string;
  team: "bureau" | "static" | "defector";
}) {
  const { data: inserted, error: insertError } = await supabase
    .from("operation_participants")
    .insert({
      id: `opp_${crypto.randomUUID()}`,
      operation_id: operationId,
      character_id: characterId,
      team,
      role: "member",
    })
    .select("id, team, role")
    .single();

  if (insertError) {
    if (isDuplicateKeyError(insertError)) {
      const { data: concurrentExisting, error: concurrentExistingError } = await supabase
        .from("operation_participants")
        .select("id, team, role")
        .eq("operation_id", operationId)
        .eq("character_id", characterId)
        .is("deleted_at", null)
        .maybeSingle();

      if (!concurrentExistingError && concurrentExisting) {
        return {
          status: 200,
          body: {
            data: {
              participantId: concurrentExisting.id,
              team: concurrentExisting.team,
              role: concurrentExisting.role,
              alreadyJoined: true,
            },
          },
        };
      }
    }

    const code = (insertError as { code?: string } | null)?.code;
    if (code === "42501") {
      return { status: 403, body: { error: "FORBIDDEN" } };
    }

    return { status: 500, body: { error: "FAILED_TO_JOIN_OPERATION" } };
  }

  return {
    status: 201,
    body: {
      data: {
        participantId: inserted.id,
        team: inserted.team,
        role: inserted.role,
        alreadyJoined: false,
      },
    },
  };
}

function mapFactionToTeam(faction: string | null | undefined): "bureau" | "static" | "defector" | null {
  if (faction === "bureau") return "bureau";
  if (faction === "static") return "static";
  if (faction === "defector") return "defector";
  return null;
}

/**
 * POST /api/operations/[id]/join
 *
 * 현재 로그인한 사용자의 "승인 캐릭터"를 작전 참가자로 등록한다.
 * - 이미 참가 중이면 200(alreadyJoined=true)
 * - 신규 참가면 201(alreadyJoined=false)
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: operationId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }

    const { data: myCharacter, error: myCharacterError } = await supabase
      .from("characters")
      .select("id, faction")
      .eq("user_id", user.id)
      .eq("status", "approved")
      .is("deleted_at", null)
      .maybeSingle();

    if (myCharacterError) {
      return NextResponse.json({ error: "FAILED_TO_FETCH_CHARACTER" }, { status: 500 });
    }

    if (!myCharacter) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }

    const { data: operation, error: operationError } = await supabase
      .from("operations")
      .select("id, type, status, created_by")
      .eq("id", operationId)
      .is("deleted_at", null)
      .maybeSingle();

    if (operationError) {
      return NextResponse.json({ error: "FAILED_TO_FETCH_OPERATION" }, { status: 500 });
    }

    if (!operation) {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }

    if (operation.status === "completed") {
      return NextResponse.json({ error: "OPERATION_CLOSED" }, { status: 409 });
    }

    const { data: existing, error: existingError } = await supabase
      .from("operation_participants")
      .select("id, team, role")
      .eq("operation_id", operationId)
      .eq("character_id", myCharacter.id)
      .is("deleted_at", null)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json(
        { error: "FAILED_TO_FETCH_OPERATION_PARTICIPANT" },
        { status: 500 },
      );
    }

    if (existing) {
      return NextResponse.json(
        {
          data: {
            participantId: existing.id,
            team: existing.team,
            role: existing.role,
            alreadyJoined: true,
          },
        },
        { status: 200 },
      );
    }

    const team = mapFactionToTeam(myCharacter.faction);
    if (!team) {
      return NextResponse.json({ error: "INVALID_FACTION" }, { status: 422 });
    }

    const { data: joinResult, error: joinError } = await supabase.rpc("join_operation_participant", {
      p_operation_id: operationId,
      p_character_id: myCharacter.id,
      p_team: team,
      p_participant_id: `opp_${crypto.randomUUID()}`,
    });

    if (joinError) {
      if (isMissingJoinRpcFunction(joinError)) {
        const legacy = await joinWithLegacyInsert({
          supabase,
          operationId,
          characterId: myCharacter.id,
          team,
        });

        return NextResponse.json(legacy.body, { status: legacy.status });
      }

      if (isDuplicateKeyError(joinError)) {
        const { data: concurrentExisting, error: concurrentExistingError } = await supabase
          .from("operation_participants")
          .select("id, team, role")
          .eq("operation_id", operationId)
          .eq("character_id", myCharacter.id)
          .is("deleted_at", null)
          .maybeSingle();

        if (!concurrentExistingError && concurrentExisting) {
          return NextResponse.json(
            {
              data: {
                participantId: concurrentExisting.id,
                team: concurrentExisting.team,
                role: concurrentExisting.role,
                alreadyJoined: true,
              },
            },
            { status: 200 },
          );
        }
      }

      const mapped = mapJoinRpcError(joinError.message);
      return NextResponse.json({ error: mapped.code }, { status: mapped.status });
    }

    const normalized = joinResult as
      | { state: "joined"; participant_id: string; team: string; role: string }
      | { state: "already_joined"; participant_id: string; team: string; role: string }
      | { state: "operation_full" };

    if (normalized?.state === "operation_full") {
      return NextResponse.json({ error: "OPERATION_FULL" }, { status: 409 });
    }

    if (
      normalized?.state === "already_joined" &&
      normalized.participant_id &&
      normalized.team &&
      normalized.role
    ) {
      return NextResponse.json(
        {
          data: {
            participantId: normalized.participant_id,
            team: normalized.team,
            role: normalized.role,
            alreadyJoined: true,
          },
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        data: {
          participantId: normalized.participant_id,
          team: normalized.team,
          role: normalized.role,
          alreadyJoined: false,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[api/operations/[id]/join] unexpected error:", error);
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
