import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { operationActionSchema } from "@/lib/operation/schemas";

function mapSubmitError(message: string): { code: string; status: number } {
  if (message.includes("UNAUTHENTICATED")) return { code: "UNAUTHENTICATED", status: 401 };
  if (message.includes("FORBIDDEN")) return { code: "FORBIDDEN", status: 403 };
  if (message.includes("INSUFFICIENT_COST")) return { code: "INSUFFICIENT_COST", status: 409 };
  if (message.includes("OUT_OF_ORDER")) return { code: "OUT_OF_ORDER", status: 409 };
  if (message.includes("ALREADY_SUBMITTED")) return { code: "ALREADY_SUBMITTED", status: 409 };
  if (message.includes("INVALID_ABILITY")) return { code: "INVALID_ABILITY", status: 400 };
  if (message.includes("TURN_NOT_COLLECTING")) return { code: "TURN_NOT_COLLECTING", status: 409 };
  return { code: "INTERNAL_SERVER_ERROR", status: 500 };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = operationActionSchema.safeParse(body);

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

    const { data, error } = await supabase.rpc("submit_operation_action", {
      p_encounter_id: id,
      p_ability_id: payload.ability_id,
      p_action_type: payload.action_type,
      p_target_character_id: (payload.target_character_id ?? null) as string,
      p_target_stat: (payload.target_stat ?? null) as string,
      p_base_damage: payload.base_damage,
      p_multiplier: payload.multiplier,
      p_narrative: (payload.narrative ?? null) as string,
    });

    if (error) {
      const mapped = mapSubmitError(error.message);
      return NextResponse.json({ error: mapped.code }, { status: mapped.status });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("[operation/submissions] unexpected error", error);
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
