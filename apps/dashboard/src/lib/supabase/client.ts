"use client";

import { createBrowserClient } from "@supabase/ssr";
import { envClient } from "@/lib/env.client";

/** 브라우저(클라이언트 컴포넌트)용 Supabase 클라이언트 */
export function createClient() {
  return createBrowserClient(
    envClient.NEXT_PUBLIC_SUPABASE_URL,
    envClient.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
