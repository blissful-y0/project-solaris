import { parsePublicEnv } from "./env.shared";

/**
 * 클라이언트 환경변수 — Next.js는 process.env 전체 객체를 인라인하지 않으므로
 * NEXT_PUBLIC_* 키를 개별 참조하여 명시적으로 전달한다.
 */
export const envClient = parsePublicEnv({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
} as NodeJS.ProcessEnv);
