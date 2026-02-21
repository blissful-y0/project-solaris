import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockCreateClient,
  mockGetUser,
  mockFrom,
  mockOpSelect,
  mockOpInsertSingle,
  mockParticipantsIs,
  mockCharacterMaybeSingle,
} = vi.hoisted(() => ({
  mockCreateClient: vi.fn(),
  mockGetUser: vi.fn(),
  mockFrom: vi.fn(),
  mockOpSelect: vi.fn(),
  mockOpInsertSingle: vi.fn(),
  mockParticipantsIs: vi.fn(),
  mockCharacterMaybeSingle: vi.fn(),
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
        chain.order = vi.fn(() => chain);
        chain.range = mockOpSelect;
        return {
          select: () => ({
            is: () => ({
              eq: chain.eq,
              order: chain.order,
              range: chain.range,
            }),
          }),
          insert: () => ({
            select: () => ({
              single: mockOpInsertSingle,
            }),
          }),
        };
      }

      if (table === "operation_participants") {
        return {
          select: () => ({
            in: () => ({
              is: mockParticipantsIs,
            }),
          }),
        };
      }

      if (table === "characters") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                is: () => ({
                  maybeSingle: mockCharacterMaybeSingle,
                }),
              }),
            }),
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
    mockParticipantsIs.mockResolvedValue({
      data: [
        {
          operation_id: "op-1",
          team: "bureau",
          character: { id: "ch-1", name: "루시엘", faction: "bureau" },
        },
      ],
      error: null,
    });

    const { GET } = await import("../route");
    const response = await GET(new Request("http://localhost/api/operations?type=downtime"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mockParticipantsIs).toHaveBeenCalledWith("deleted_at", null);
    expect(body.data).toHaveLength(1);
    expect(body.data[0]).toEqual(
      expect.objectContaining({
        id: "op-1",
        type: "downtime",
        host: { id: "ch-1", name: "루시엘" },
      }),
    );
  });

  it("OPERATION은 faction 기준으로 teamA/teamB를 구성한다", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockOpSelect.mockResolvedValue({
      data: [
        {
          id: "op-2",
          title: "전투 테스트",
          type: "operation",
          status: "waiting",
          summary: "요약",
          is_main_story: false,
          max_participants: 4,
          created_at: "2026-02-21T10:36:33.577404+00:00",
          created_by: "ch-host",
        },
      ],
      error: null,
    });
    mockParticipantsIs.mockResolvedValue({
      data: [
        {
          operation_id: "op-2",
          team: "bureau",
          character: { id: "ch-b", name: "아마츠키 레이", faction: "bureau" },
        },
        {
          operation_id: "op-2",
          team: "static",
          character: { id: "ch-s", name: "루시엘 린", faction: "static" },
        },
        {
          operation_id: "op-2",
          team: "defector",
          character: { id: "ch-d", name: "엘라 크루즈", faction: "defector" },
        },
      ],
      error: null,
    });

    const { GET } = await import("../route");
    const response = await GET(new Request("http://localhost/api/operations?type=operation"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data[0].teamA).toEqual([
      { id: "ch-b", name: "아마츠키 레이" },
    ]);
    expect(body.data[0].teamB).toEqual([
      { id: "ch-s", name: "루시엘 린" },
      { id: "ch-d", name: "엘라 크루즈" },
    ]);
  });
});

describe("POST /api/operations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateClient.mockResolvedValue({
      auth: { getUser: mockGetUser },
      from: mockFrom,
    });
  });

  it("summary를 비워도 201로 생성된다", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockCharacterMaybeSingle.mockResolvedValue({
      data: { id: "ch-1" },
      error: null,
    });
    mockOpInsertSingle.mockResolvedValue({
      data: {
        id: "op-new",
        title: "새 작전",
        type: "operation",
        status: "waiting",
        summary: "",
        is_main_story: false,
        max_participants: 4,
        created_at: "2026-02-21T12:00:00Z",
        created_by: "ch-1",
      },
      error: null,
    });

    const { POST } = await import("../route");
    const response = await POST(
      new Request("http://localhost/api/operations", {
        method: "POST",
        body: JSON.stringify({
          type: "operation",
          title: "새 작전",
          summary: "   ",
        }),
      }),
    );

    expect(response.status).toBe(201);
  });

  it("title이 101자 이상이면 400을 반환한다", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockCharacterMaybeSingle.mockResolvedValue({
      data: { id: "ch-1" },
      error: null,
    });

    const { POST } = await import("../route");
    const response = await POST(
      new Request("http://localhost/api/operations", {
        method: "POST",
        body: JSON.stringify({
          type: "operation",
          title: "a".repeat(101),
          summary: "",
        }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: "INVALID_TITLE" });
  });
});
