import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockCreateClient,
  mockGetUser,
  mockFrom,
  mockOperationMaybeSingle,
  mockParticipantsEq,
  mockMessagesEq,
} = vi.hoisted(() => ({
  mockCreateClient: vi.fn(),
  mockGetUser: vi.fn(),
  mockFrom: vi.fn(),
  mockOperationMaybeSingle: vi.fn(),
  mockParticipantsEq: vi.fn(),
  mockMessagesEq: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mockCreateClient,
}));

describe("GET /api/operations/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockCreateClient.mockResolvedValue({
      auth: { getUser: mockGetUser },
      from: mockFrom,
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === "operations") {
        return {
          select: () => ({
            eq: () => ({
              is: () => ({
                maybeSingle: mockOperationMaybeSingle,
              }),
            }),
          }),
        };
      }

      if (table === "operation_participants") {
        return {
          select: () => ({
            eq: mockParticipantsEq,
          }),
        };
      }

      if (table === "operation_messages") {
        return {
          select: () => ({
            eq: mockMessagesEq,
          }),
        };
      }

      if (table === "characters") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                is: () => ({
                  maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
                }),
              }),
            }),
          }),
        };
      }

      throw new Error(`unexpected table: ${table}`);
    });
  });

  it("미인증이면 401", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const { GET } = await import("../route");
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ id: "op-1" }),
    });

    expect(response.status).toBe(401);
  });

  it("상세를 반환한다", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockOperationMaybeSingle.mockResolvedValue({
      data: {
        id: "op-1",
        title: "다운타임 A",
        type: "downtime",
        status: "live",
        summary: "요약",
        is_main_story: false,
        max_participants: 8,
        created_at: "2026-02-20T00:00:00.000Z",
      },
      error: null,
    });
    mockParticipantsEq.mockResolvedValue({
      data: [
        {
          character_id: "ch-1",
          team: "host",
          character: {
            id: "ch-1",
            name: "루시엘",
            faction: "bureau",
            ability_class: "support",
            hp_current: 80,
            hp_max: 80,
            will_current: 250,
            will_max: 250,
            profile_image_url: null,
          },
        },
      ],
      error: null,
    });
    mockMessagesEq.mockReturnValue({
      order: vi.fn().mockResolvedValue({
        data: [
          {
            id: "msg-1",
            type: "narration",
            content: "테스트 메시지",
            created_at: "2026-02-20T00:01:00.000Z",
            sender_character_id: "ch-1",
            sender: { id: "ch-1", name: "루시엘", profile_image_url: null },
          },
        ],
        error: null,
      }),
    });

    const { GET } = await import("../route");
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ id: "op-1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual(
      expect.objectContaining({
        id: "op-1",
        messages: expect.arrayContaining([
          expect.objectContaining({
            id: "msg-1",
            content: "테스트 메시지",
          }),
        ]),
      }),
    );
  });
});
