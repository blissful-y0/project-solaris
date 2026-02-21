import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function isDuplicateKeyError(error: unknown) {
  const code = (error as { code?: string } | null)?.code;
  return code === "23505";
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
      .select("id, type, created_by")
      .eq("id", operationId)
      .is("deleted_at", null)
      .maybeSingle();

    if (operationError) {
      return NextResponse.json({ error: "FAILED_TO_FETCH_OPERATION" }, { status: 500 });
    }

    if (!operation) {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
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

    const { data: inserted, error: insertError } = await supabase
      .from("operation_participants")
      .insert({
        id: `opp_${crypto.randomUUID()}`,
        operation_id: operationId,
        character_id: myCharacter.id,
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

      return NextResponse.json({ error: "FAILED_TO_JOIN_OPERATION" }, { status: 500 });
    }

    return NextResponse.json(
      {
        data: {
          participantId: inserted.id,
          team: inserted.team,
          role: inserted.role,
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
