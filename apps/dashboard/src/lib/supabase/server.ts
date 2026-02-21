import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { envServer } from "@/lib/env.server";
import type { AppDatabase } from "./app-database.types";

/** 서버 컴포넌트 / Route Handler용 Supabase 클라이언트 */
export async function createClient(): Promise<SupabaseClient<AppDatabase>> {
  const cookieStore = await cookies();

  return createServerClient<AppDatabase>(
    envServer.NEXT_PUBLIC_SUPABASE_URL,
    envServer.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch (error) {
            if (process.env.NODE_ENV === "development") {
              console.warn("[supabase/server] cookie set skipped", error);
            }
          }
        },
      },
    },
  );
}
