import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockCreateClient, mockGetUser, mockFrom, mockMaybeSingle } = vi.hoisted(() => ({
  mockCreateClient: vi.fn(),
  mockGetUser: vi.fn(),
  mockFrom: vi.fn(),
  mockMaybeSingle: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mockCreateClient,
}));

describe("GET /api/me", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateClient.mockResolvedValue({
      auth: { getUser: mockGetUser },
      from: mockFrom,
    });

    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          is: vi.fn(() => ({
            maybeSingle: mockMaybeSingle,
          })),
        })),
      })),
    });
  });

  it("미인증 사용자는 401을 반환한다", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const { GET } = await import("../route");
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({ error: "UNAUTHENTICATED" });
  });

  it("인증 사용자는 user + character null을 반환한다", async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: "user-1",
          email: "user@solaris.test",
          user_metadata: { full_name: "테스트 유저" },
        },
      },
    });
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });

    const { GET } = await import("../route");
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      user: {
        id: "user-1",
        email: "user@solaris.test",
        displayName: "테스트 유저",
      },
      character: null,
    });
  });

  it("인증 + 캐릭터가 있으면 함께 반환한다", async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: "user-1",
          email: "user@solaris.test",
          user_metadata: { full_name: "테스트 유저" },
        },
      },
    });
    mockMaybeSingle.mockResolvedValue({
      data: {
        id: "char-1",
        name: "아마츠키 레이",
        status: "approved",
        profile_image_url: null,
        faction: "bureau",
        ability_class: "field",
        hp_max: 80,
        hp_current: 80,
        will_max: 250,
        will_current: 230,
        resonance_rate: 87,
        created_at: "2026-02-18T00:00:00.000Z",
      },
      error: null,
    });

    const { GET } = await import("../route");
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.character).toEqual(
      expect.objectContaining({
        id: "char-1",
        name: "아마츠키 레이",
        status: "approved",
      }),
    );
  });
});
