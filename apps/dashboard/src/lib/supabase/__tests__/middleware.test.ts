import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const ORIGINAL_ENV = { ...process.env };

const { mockGetUser } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}));

function setRequiredEnv() {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
}

describe("updateSession", () => {
  beforeEach(() => {
    setRequiredEnv();
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("미인증 사용자가 비공개 경로 접근 시 로그인으로 리다이렉트한다", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const request = new NextRequest(
      "https://solaris.local/core?tab=briefing",
    );

    const { updateSession } = await import("../middleware");
    const response = await updateSession(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://solaris.local/login?redirect=%2Fcore%3Ftab%3Dbriefing",
    );
  });

  it("인증 사용자가 로그인 페이지 접근 시 홈으로 리다이렉트한다", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
    });
    const request = new NextRequest("https://solaris.local/login");

    const { updateSession } = await import("../middleware");
    const response = await updateSession(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://solaris.local/");
  });

  it("공개 경로 접근은 통과시킨다", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const request = new NextRequest("https://solaris.local/_next/static/chunk.js");

    const { updateSession } = await import("../middleware");
    const response = await updateSession(request);

    expect(response.headers.get("location")).toBeNull();
    expect(response.status).toBe(200);
  });

  it("미인증 API 요청은 로그인 리다이렉트가 아니라 401 JSON을 반환한다", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const request = new NextRequest("https://solaris.local/api/notifications");

    const { updateSession } = await import("../middleware");
    const response = await updateSession(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(response.headers.get("location")).toBeNull();
    expect(body).toEqual({ error: "UNAUTHENTICATED" });
  });
});
