import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

function setRequiredEnv() {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
}

describe("env", () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.resetModules();
  });

  it("필수 Supabase 환경변수가 있으면 파싱에 성공한다", async () => {
    setRequiredEnv();

    const { env } = await import("../env");

    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBe("https://example.supabase.co");
    expect(env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe("anon-key");
  });

  it("필수 Supabase 환경변수가 없으면 명확한 에러를 던진다", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    setRequiredEnv();
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;

    await expect(import("../env")).rejects.toThrowError(
      /NEXT_PUBLIC_SUPABASE_URL/,
    );
  });
});
