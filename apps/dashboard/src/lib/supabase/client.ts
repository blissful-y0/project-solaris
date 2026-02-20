"use client";

import { createBrowserClient } from "@supabase/ssr";
import { envClient } from "@/lib/env.client";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

/** 브라우저(클라이언트 컴포넌트)용 Supabase 클라이언트 */
export function createClient() {
  if (browserClient) {
    return browserClient;
  }

  browserClient = createBrowserClient(
    envClient.NEXT_PUBLIC_SUPABASE_URL,
    envClient.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  return browserClient;
}
