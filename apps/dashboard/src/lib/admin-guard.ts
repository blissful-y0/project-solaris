import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }

  const { data: userRow, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("[admin-guard] users 테이블 조회 실패:", error.message, error.code);
    throw new Error("ADMIN_CHECK_FAILED");
  }

  if (userRow?.role !== "admin") {
    throw new Error("FORBIDDEN");
  }

  return { supabase, user };
}
