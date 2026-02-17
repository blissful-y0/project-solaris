import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url("NEXT_PUBLIC_SUPABASE_URL이 올바른 URL이 아닙니다."),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY가 비어 있습니다."),
});

const parsedEnv = envSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

if (!parsedEnv.success) {
  const missingKeys = parsedEnv.error.issues
    .map((issue) => String(issue.path[0]))
    .filter(Boolean)
    .join(", ");

  throw new Error(
    `환경변수 검증 실패: ${missingKeys}. .env 파일을 확인하세요.`,
  );
}

export const env = parsedEnv.data;
