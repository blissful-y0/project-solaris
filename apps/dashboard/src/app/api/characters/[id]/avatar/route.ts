import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isValidId } from "@/lib/api/validate-id";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

async function requireOwnerCharacter(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase, user: null, character: null, error: "UNAUTHENTICATED" as const };

  const { data: character, error: charError } = await supabase
    .from("characters")
    .select("id, user_id, profile_image_url")
    .eq("id", id)
    .eq("status", "approved")
    .is("deleted_at", null)
    .single();

  if (charError || !character) return { supabase, user, character: null, error: "CHARACTER_NOT_FOUND" as const };
  if (character.user_id !== user.id) return { supabase, user, character: null, error: "FORBIDDEN" as const };

  return { supabase, user, character, error: null };
}

/** 프로필 이미지 signed upload URL 발급 — 본인 캐릭터만 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!isValidId(id)) {
      return NextResponse.json({ error: "INVALID_ID" }, { status: 400 });
    }
    const owned = await requireOwnerCharacter(id);
    if (owned.error === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }
    if (owned.error === "CHARACTER_NOT_FOUND") {
      return NextResponse.json({ error: "CHARACTER_NOT_FOUND" }, { status: 404 });
    }
    if (owned.error === "FORBIDDEN") {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }

    const body = (await req.json()) as { ext?: string; contentType?: string; size?: number };
    const contentType = body.contentType ?? "";
    const size = Number(body.size ?? 0);
    if (!ALLOWED_TYPES.includes(contentType)) {
      return NextResponse.json({ error: "INVALID_FILE_TYPE" }, { status: 400 });
    }
    if (size <= 0 || size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "FILE_TOO_LARGE" }, { status: 400 });
    }

    const ext = (body.ext ?? "jpg").replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "jpg";
    const path = `${owned.user!.id}/${id}/${Date.now()}.${ext}`;
    const { data, error } = await owned.supabase.storage
      .from("character-profile-images")
      .createSignedUploadUrl(path);

    if (error || !data) {
      return NextResponse.json(
        { error: "FAILED_TO_CREATE_SIGNED_UPLOAD_URL", detail: error?.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ path: data.path, token: data.token });
  } catch (error) {
    console.error("[avatar] signed url 발급 실패:", error);
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}

/** 업로드 완료 후 DB URL 반영 + 이전 파일 삭제 — 본인 캐릭터만 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!isValidId(id)) {
      return NextResponse.json({ error: "INVALID_ID" }, { status: 400 });
    }
    const owned = await requireOwnerCharacter(id);
    if (owned.error === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }
    if (owned.error === "CHARACTER_NOT_FOUND") {
      return NextResponse.json({ error: "CHARACTER_NOT_FOUND" }, { status: 404 });
    }
    if (owned.error === "FORBIDDEN") {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }

    const body = (await req.json()) as { path?: string };
    if (!body.path || !body.path.startsWith(`${owned.user!.id}/${id}/`)) {
      return NextResponse.json({ error: "INVALID_PATH" }, { status: 400 });
    }

    const { data: urlData } = owned.supabase.storage
      .from("character-profile-images")
      .getPublicUrl(body.path);

    /* DB 업데이트 (먼저 실행 — 실패 시 이전 파일 유지) */
    const { error: updateError } = await owned.supabase
      .from("characters")
      .update({ profile_image_url: urlData.publicUrl })
      .eq("id", id);

    if (updateError) {
      console.error("[avatar] DB 업데이트 실패:", updateError.message);
      return NextResponse.json({ error: "UPDATE_FAILED" }, { status: 500 });
    }

    /* 이전 아바타 삭제 — DB 업데이트 성공 후 best-effort 정리
       RLS DELETE 정책이 인증 유저 자기 파일 삭제를 허용하므로 user-scoped 클라이언트 사용 */
    const oldUrl = owned.character!.profile_image_url;
    if (oldUrl) {
      try {
        const bucketSegment = "/object/public/character-profile-images/";
        const idx = oldUrl.indexOf(bucketSegment);
        if (idx !== -1) {
          const oldPath = decodeURIComponent(oldUrl.substring(idx + bucketSegment.length));
          const expectedPrefix = `${owned.user!.id}/${id}/`;
          if (!oldPath.startsWith(expectedPrefix)) {
            console.warn("[avatar] 이전 파일 경로가 현재 사용자/캐릭터와 불일치 — 삭제 건너뜀:", oldPath);
          } else {
            const { error: removeError } = await owned.supabase.storage
              .from("character-profile-images")
              .remove([oldPath]);
            if (removeError) {
              console.warn("[avatar] 이전 파일 삭제 실패 (무시):", removeError.message);
            }
          }
        }
      } catch (cleanupErr) {
        console.warn("[avatar] 이전 파일 정리 중 에러 (무시):", cleanupErr);
      }
    }

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (error) {
    console.error("[avatar] 예상치 못한 에러:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 },
    );
  }
}
