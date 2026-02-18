import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

const { mockExchangeCodeForSession, mockGetUser, mockUpsert, mockCookies } =
  vi.hoisted(() => ({
  mockExchangeCodeForSession: vi.fn(),
  mockGetUser: vi.fn(),
  mockUpsert: vi.fn(),
  mockCookies: vi.fn(async () => ({
    getAll: () => [],
    set: vi.fn(),
  })),
  }));

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      exchangeCodeForSession: mockExchangeCodeForSession,
      getUser: mockGetUser,
    },
    from: vi.fn(() => ({
      upsert: mockUpsert,
    })),
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
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: "0a66be4b-c908-4f8f-8478-48cb12695f11",
          user_metadata: {
            provider_id: "1234567890",
            full_name: "solaris-user",
          },
        },
      },
    });
    mockUpsert.mockResolvedValue({ error: null });
    const request = new Request(
      "https://solaris.local/api/auth/callback?code=valid&next=%2Fcore",
    );

    const { GET } = await import("../route");
    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://solaris.local/core");
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "0a66be4b-c908-4f8f-8478-48cb12695f11",
        discord_id: "1234567890",
        discord_username: "solaris-user",
      }),
      { onConflict: "id" },
    );
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
