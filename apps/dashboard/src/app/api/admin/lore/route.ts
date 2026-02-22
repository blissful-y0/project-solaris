import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getServiceClient } from "@/lib/supabase/service";

/** GET /api/admin/lore — 전체 문서 목록 */
export async function GET() {
  try {
    const { supabase } = await requireAdmin();

    const { data, error } = await supabase
      .from("lore_documents" as never)
      .select("id, title, slug, content, clearance_level, order_index, created_at, updated_at")
      .is("deleted_at", null)
      .order("order_index", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: "FAILED_TO_FETCH" }, { status: 500 });
    }

    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}

/** POST /api/admin/lore — 신규 문서 생성 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json().catch(() => null);
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const slug = typeof body?.slug === "string" ? body.slug.trim() : "";
    const content = typeof body?.content === "string" ? body.content : "";
    const clearanceLevel = [1, 2, 3].includes(body?.clearanceLevel)
      ? (body.clearanceLevel as 1 | 2 | 3)
      : 1;
    const orderIndex = typeof body?.orderIndex === "number" ? body.orderIndex : 0;

    if (!title || !slug) {
      return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
    }

    const db = getServiceClient();

    const { data, error } = await db
      .from("lore_documents" as never)
      .insert({
        id: `lore_${crypto.randomUUID()}`,
        title,
        slug,
        content,
        clearance_level: clearanceLevel,
        order_index: orderIndex,
      })
      .select("id, title, slug, clearance_level, order_index, created_at, updated_at")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "SLUG_CONFLICT" }, { status: 409 });
      }
      return NextResponse.json({ error: "FAILED_TO_CREATE" }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
