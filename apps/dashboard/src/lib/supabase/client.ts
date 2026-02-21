"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { envClient } from "@/lib/env.client";
import type { AppDatabase } from "./app-database.types";

let browserClient: SupabaseClient<AppDatabase> | null = null;

/** 브라우저(클라이언트 컴포넌트)용 Supabase 클라이언트 */
export function createClient(): SupabaseClient<AppDatabase> {
  if (browserClient) {
    return browserClient;
  }

  browserClient = createBrowserClient<AppDatabase>(
    envClient.NEXT_PUBLIC_SUPABASE_URL,
    envClient.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  return browserClient;
}
