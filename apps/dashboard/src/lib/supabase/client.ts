"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { envClient } from "@/lib/env.client";
import type { Database } from "./database.types";

let browserClient: SupabaseClient<Database> | null = null;

/** 브라우저(클라이언트 컴포넌트)용 Supabase 클라이언트 */
export function createClient(): SupabaseClient<Database> {
  if (browserClient) {
    return browserClient;
  }

  browserClient = createBrowserClient<Database>(
    envClient.NEXT_PUBLIC_SUPABASE_URL,
    envClient.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  return browserClient;
}
