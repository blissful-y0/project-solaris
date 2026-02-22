import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/** Service role 클라이언트 — API route 서버 코드 전용 */
export function getServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
