import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockCreateClient,
  mockGetUser,
  mockFrom,
  mockRange,
} = vi.hoisted(() => ({
  mockCreateClient: vi.fn(),
  mockGetUser: vi.fn(),
  mockFrom: vi.fn(),
  mockRange: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mockCreateClient,
}));

describe("GET /api/characters", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockCreateClient.mockResolvedValue({
      auth: { getUser: mockGetUser },
      from: mockFrom,
    });

    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          is: () => ({
            order: () => ({
              range: mockRange,
            }),
          }),
        }),
      }),
    });
  });

  it("미인증이면 401을 반환한다", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const { GET } = await import("../route");
    const res = await GET(new Request("http://localhost/api/characters"));
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body).toEqual({ error: "UNAUTHENTICATED" });
  });

  it("기본 페이지 사이즈 20으로 목록/페이지 정보를 반환한다", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockRange.mockResolvedValue({
      data: [
        {
          id: "char-1",
          user_id: "user-1",
          name: "테스터",
          faction: "bureau",
          ability_class: "field",
          profile_image_url: null,
          is_leader: false,
        },
      ],
      error: null,
    });

    const { GET } = await import("../route");
    const res = await GET(new Request("http://localhost/api/characters"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(mockRange).toHaveBeenCalledWith(0, 19);
    expect(body.data).toEqual([
      expect.objectContaining({
        id: "char-1",
        is_mine: true,
      }),
    ]);
    expect(body.page).toEqual({
      limit: 20,
      offset: 0,
      hasMore: false,
      nextOffset: null,
    });
  });

  it("limit/offset 쿼리를 반영한다", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockRange.mockResolvedValue({ data: [], error: null });

    const { GET } = await import("../route");
    const res = await GET(
      new Request("http://localhost/api/characters?limit=40&offset=20"),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(mockRange).toHaveBeenCalledWith(20, 59);
    expect(body.page).toEqual({
      limit: 40,
      offset: 20,
      hasMore: false,
      nextOffset: null,
    });
  });
});
