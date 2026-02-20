import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { createClient } from "@/lib/supabase/server";
import { resolveTurnSchema } from "@/lib/operation/schemas";
import { computeResolution } from "@/lib/operation/resolve";

function mapResolveError(message: string): { code: string; status: number } {
  if (message.includes("UNAUTHENTICATED")) return { code: "UNAUTHENTICATED", status: 401 };
  if (message.includes("FORBIDDEN")) return { code: "FORBIDDEN", status: 403 };
  if (message.includes("IDEMPOTENCY_CONFLICT")) return { code: "IDEMPOTENCY_CONFLICT", status: 409 };
  if (message.includes("TURN_NOT_FOUND")) return { code: "TURN_NOT_FOUND", status: 404 };
  return { code: "INTERNAL_SERVER_ERROR", status: 500 };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = resolveTurnSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_REQUEST", issues: parsed.error.issues }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }

    const payload = parsed.data;

    const { data: turn, error: turnError } = await supabase
      .from("operation_turns")
      .select("id, encounter_id, turn_number, status")
      .eq("id", payload.turn_id)
      .eq("encounter_id", id)
      .single();

    if (turnError || !turn) {
      return NextResponse.json({ error: "TURN_NOT_FOUND" }, { status: 404 });
    }

    const { data: participants, error: participantError } = await supabase
      .from("operation_encounter_participants")
      .select("character_id, team, submission_order")
      .eq("encounter_id", id)
      .eq("is_active", true)
      .order("submission_order");

    if (participantError || !participants) {
      return NextResponse.json({ error: "FAILED_TO_LOAD_PARTICIPANTS" }, { status: 500 });
    }

    const { data: existingSubmissions, error: submissionError } = await supabase
      .from("operation_turn_submissions")
      .select("*")
      .eq("turn_id", turn.id);

    if (submissionError) {
      return NextResponse.json({ error: "FAILED_TO_LOAD_SUBMISSIONS" }, { status: 500 });
    }

    const existingActorSet = new Set(
      (existingSubmissions ?? []).map((item) => item.participant_character_id),
    );

    const missingRows = participants
      .filter((item) => !existingActorSet.has(item.character_id))
      .map((item) => ({
        id: `os_${nanoid(12)}`,
        turn_id: turn.id,
        participant_character_id: item.character_id,
        ability_id: null,
        ability_tier: "basic",
        action_type: "attack",
        target_character_id: item.character_id,
        target_stat: "hp",
        base_damage: 0,
        multiplier: 0,
        cost_hp: 0,
        cost_will: 0,
        narrative: null,
        is_auto_fail: true,
      }));

    if (missingRows.length > 0) {
      const { error: autofailError } = await supabase
        .from("operation_turn_submissions")
        .upsert(missingRows, { onConflict: "turn_id,participant_character_id", ignoreDuplicates: true });

      if (autofailError) {
        return NextResponse.json({ error: "FAILED_TO_MARK_AUTO_FAIL" }, { status: 500 });
      }
    }

    const { data: submissions, error: reloadError } = await supabase
      .from("operation_turn_submissions")
      .select("*")
      .eq("turn_id", turn.id);

    if (reloadError || !submissions) {
      return NextResponse.json({ error: "FAILED_TO_LOAD_SUBMISSIONS" }, { status: 500 });
    }

    const { resolved, effects } = await computeResolution(supabase, {
      participants,
      submissions,
      judgementActions: payload.judgement?.actions ?? [],
    });

    const hasDefeated = Object.values(resolved.participants).some((state) => state.hp <= 0);

    const { data: rpcResult, error: rpcError } = await supabase.rpc("apply_operation_resolution", {
      p_turn_id: turn.id,
      p_idempotency_key: payload.idempotency_key,
      p_action_results: resolved.actions,
      p_effects: effects,
      p_execution_summary: {
        encounter_id: id,
        turn_id: turn.id,
        turn_number: turn.turn_number,
        post_state: resolved.participants,
      },
      p_close_result: hasDefeated ? "defeated" : null,
      p_closed_by: hasDefeated ? user.id : null,
    });

    if (rpcError) {
      const mapped = mapResolveError(rpcError.message);
      return NextResponse.json({ error: mapped.code }, { status: mapped.status });
    }

    return NextResponse.json({
      data: {
        turn_id: turn.id,
        encounter_id: id,
        actions: resolved.actions,
        effects,
        post_state: resolved.participants,
        rpc_result: rpcResult,
      },
    });
  } catch (error) {
    console.error("[operation/resolve] unexpected error", error);
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
