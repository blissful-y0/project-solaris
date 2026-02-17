import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

const { mockExchangeCodeForSession, mockCookies } = vi.hoisted(() => ({
  mockExchangeCodeForSession: vi.fn(),
  mockCookies: vi.fn(async () => ({
    getAll: () => [],
    set: vi.fn(),
  })),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      exchangeCodeForSession: mockExchangeCodeForSession,
    },
  })),
}));

vi.mock("next/headers", () => ({
  cookies: mockCookies,
}));

function setRequiredEnv() {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
}

describe("GET /api/auth/callback", () => {
  beforeEach(() => {
    setRequiredEnv();
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("유효 code면 세션 교환 후 next 경로로 리다이렉트한다", async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: null });
    const request = new Request(
      "https://solaris.local/api/auth/callback?code=valid&next=%2Fcore",
    );

    const { GET } = await import("../route");
    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://solaris.local/core");
  });

  it("무효 code면 로그인 에러 경로로 리다이렉트한다", async () => {
    mockExchangeCodeForSession.mockResolvedValue({
      error: new Error("invalid"),
    });
    const request = new Request(
      "https://solaris.local/api/auth/callback?code=invalid",
    );

    const { GET } = await import("../route");
    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://solaris.local/login?error=auth_failed",
    );
  });

  it("next에 외부 경로가 와도 open redirect를 차단한다", async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: null });
    const request = new Request(
      "https://solaris.local/api/auth/callback?code=valid&next=%2F%2Fevil.com",
    );

    const { GET } = await import("../route");
    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://solaris.local/");
  });
});
