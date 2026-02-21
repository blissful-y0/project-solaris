import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

const { mockExchangeCodeForSession, mockGetUser, mockUpsert, mockMaybeSingle, mockCookies } =
  vi.hoisted(() => ({
  mockExchangeCodeForSession: vi.fn(),
  mockGetUser: vi.fn(),
  mockUpsert: vi.fn(),
  mockMaybeSingle: vi.fn(),
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
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: mockMaybeSingle,
        })),
      })),
    })),
  })),
}));

vi.mock("next/headers", () => ({
  cookies: mockCookies,
}));

vi.mock("@/lib/supabase/service", () => ({
  getServiceClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
    })),
  })),
}));

vi.mock("@/app/actions/notification", () => ({
  createNotification: vi.fn().mockResolvedValue(undefined),
}));

function setRequiredEnv() {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
}

describe("GET /api/auth/callback", () => {
  beforeEach(() => {
    setRequiredEnv();
    mockMaybeSingle.mockResolvedValue({ data: null }); // 기본: 신규 회원
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("유효 code면 세션 교환 후 next 경로로 리다이렉트한다", async () => {
    mockExchangeCodeForSession.mockResolvedValue({
      data: { session: { provider_token: "mock-discord-token" } },
      error: null,
    });
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
      data: { session: null },
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
    mockExchangeCodeForSession.mockResolvedValue({
      data: { session: { provider_token: "mock-discord-token" } },
      error: null,
    });
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
      "https://solaris.local/api/auth/callback?code=valid&next=%2F%2Fevil.com",
    );

    const { GET } = await import("../route");
    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://solaris.local/");
  });

  it("discord provider_id가 없으면 업서트하지 않고 로그인 에러로 보낸다", async () => {
    mockExchangeCodeForSession.mockResolvedValue({
      data: { session: { provider_token: "mock-discord-token" } },
      error: null,
    });
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: "0a66be4b-c908-4f8f-8478-48cb12695f11",
          user_metadata: {
            full_name: "solaris-user",
          },
        },
      },
    });

    const request = new Request("https://solaris.local/api/auth/callback?code=valid");

    const { GET } = await import("../route");
    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://solaris.local/login?error=auth_failed",
    );
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("신규 회원 가입 시 어드민 웹훅 알림을 생성한다", async () => {
    const { createNotification } = await import("@/app/actions/notification");
    mockMaybeSingle.mockResolvedValue({ data: null }); // 신규 회원
    mockExchangeCodeForSession.mockResolvedValue({
      data: { session: { provider_token: "mock-discord-token" } },
      error: null,
    });
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
      "https://solaris.local/api/auth/callback?code=valid",
    );

    const { GET } = await import("../route");
    await GET(request);

    expect(createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "character_new_member",
        channel: "discord_webhook",
        scope: "broadcast",
      }),
      expect.anything(),
    );
  });

  it("기존 회원 로그인 시 웹훅 알림을 보내지 않는다", async () => {
    const { createNotification } = await import("@/app/actions/notification");
    mockMaybeSingle.mockResolvedValue({ data: { id: "existing-user" } }); // 기존 회원
    mockExchangeCodeForSession.mockResolvedValue({
      data: { session: { provider_token: "mock-discord-token" } },
      error: null,
    });
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
      "https://solaris.local/api/auth/callback?code=valid",
    );

    const { GET } = await import("../route");
    await GET(request);

    expect(createNotification).not.toHaveBeenCalled();
  });
});
