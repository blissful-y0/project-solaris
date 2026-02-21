import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin-guard";

/** 어드민 mutation용 service role 클라이언트 (RLS 우회, requireAdmin()으로 권한 확인 후 사용) */
function getServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

/** PUT /api/admin/lore/[id] — 문서 수정 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await requireAdmin();
    const db = getServiceClient();

    const body = await request.json().catch(() => null);
    const updates: Record<string, unknown> = {};

    if (typeof body?.title === "string" && body.title.trim()) {
      updates.title = body.title.trim();
    }
    if (typeof body?.slug === "string" && body.slug.trim()) {
      updates.slug = body.slug.trim();
    }
    if (typeof body?.content === "string") {
      updates.content = body.content;
    }
    if ([1, 2, 3].includes(body?.clearanceLevel)) {
      updates.clearance_level = body.clearanceLevel;
    }
    if (typeof body?.orderIndex === "number") {
      updates.order_index = body.orderIndex;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
    }

    const { data, error } = await db
      .from("lore_documents")
      .update(updates)
      .eq("id", id)
      .is("deleted_at", null)
      .select("id, title, slug, clearance_level, order_index, created_at, updated_at")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "SLUG_CONFLICT" }, { status: 409 });
      }
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
      }
      return NextResponse.json({ error: "FAILED_TO_UPDATE" }, { status: 500 });
    }

    return NextResponse.json({ data });
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

/** DELETE /api/admin/lore/[id] — soft delete */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await requireAdmin();
    const db = getServiceClient();

    const { data, error } = await db
      .from("lore_documents")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .is("deleted_at", null)
      .select("id");

    if (error) {
      return NextResponse.json({ error: "FAILED_TO_DELETE" }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
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
