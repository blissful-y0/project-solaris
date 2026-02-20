import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockCreateClient,
  mockGetUser,
  mockFrom,
  mockOpSelect,
  mockParticipantSelect,
} = vi.hoisted(() => ({
  mockCreateClient: vi.fn(),
  mockGetUser: vi.fn(),
  mockFrom: vi.fn(),
  mockOpSelect: vi.fn(),
  mockParticipantSelect: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mockCreateClient,
}));

describe("GET /api/operations", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockCreateClient.mockResolvedValue({
      auth: { getUser: mockGetUser },
      from: mockFrom,
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === "operations") {
        const chain: Record<string, any> = {};
        chain.eq = vi.fn(() => chain);
        chain.order = mockOpSelect;
        return {
          select: () => ({
            is: () => ({
              eq: chain.eq,
              order: chain.order,
            }),
          }),
        };
      }

      if (table === "operation_participants") {
        return {
          select: () => ({
            in: mockParticipantSelect,
          }),
        };
      }

      throw new Error(`unexpected table: ${table}`);
    });
  });

  it("미인증 사용자는 401을 반환한다", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const { GET } = await import("../route");
    const response = await GET(new Request("http://localhost/api/operations"));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({ error: "UNAUTHENTICATED" });
  });

  it("목록을 반환한다", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockOpSelect.mockResolvedValue({
      data: [
        {
          id: "op-1",
          title: "중앙 구역 점검",
          type: "downtime",
          status: "live",
          summary: "요약",
          is_main_story: false,
          max_participants: 8,
          created_at: "2026-02-20T00:00:00.000Z",
          created_by: "ch-1",
        },
      ],
      error: null,
    });
    mockParticipantSelect.mockResolvedValue({
      data: [{ operation_id: "op-1", team: "host", character: { id: "ch-1", name: "루시엘" } }],
      error: null,
    });

    const { GET } = await import("../route");
    const response = await GET(new Request("http://localhost/api/operations?type=downtime"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(body.data[0]).toEqual(
      expect.objectContaining({
        id: "op-1",
        type: "downtime",
        host: { id: "ch-1", name: "루시엘" },
      }),
    );
  });
});
