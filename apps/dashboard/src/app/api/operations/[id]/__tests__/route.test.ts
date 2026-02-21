import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockCreateClient,
  mockGetUser,
  mockFrom,
  mockOperationMaybeSingle,
  mockParticipantsEq,
  mockParticipantsIs,
  mockMessagesEq,
  mockMessagesIs,
  mockCharacterMaybeSingle,
} = vi.hoisted(() => ({
  mockCreateClient: vi.fn(),
  mockGetUser: vi.fn(),
  mockFrom: vi.fn(),
  mockOperationMaybeSingle: vi.fn(),
  mockParticipantsEq: vi.fn(),
  mockParticipantsIs: vi.fn(),
  mockMessagesEq: vi.fn(),
  mockMessagesIs: vi.fn(),
  mockCharacterMaybeSingle: vi.fn(),
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
            eq: () => ({
              is: mockParticipantsIs,
            }),
          }),
        };
      }

      if (table === "operation_messages") {
        return {
          select: () => ({
            eq: () => ({
              is: () => ({
                order: mockMessagesIs,
              }),
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

    mockCharacterMaybeSingle.mockResolvedValue({ data: null, error: null });
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
    mockCharacterMaybeSingle.mockResolvedValue({ data: { id: "ch-1" }, error: null });
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
    mockParticipantsIs.mockResolvedValue({
      data: [
        {
          character_id: "ch-1",
          team: "bureau",
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
    mockMessagesIs.mockResolvedValue({
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
    });

    const { GET } = await import("../route");
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ id: "op-1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mockParticipantsIs).toHaveBeenCalledWith("deleted_at", null);
    expect(mockMessagesIs).toHaveBeenCalled();
    expect(body.data).toEqual(
      expect.objectContaining({
        id: "op-1",
        myParticipantId: "ch-1",
        messages: expect.arrayContaining([
          expect.objectContaining({
            id: "msg-1",
            content: "테스트 메시지",
          }),
        ]),
      }),
    );
  });

  it("승인 캐릭터가 있어도 작전 미참가면 myParticipantId는 null이다", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockCharacterMaybeSingle.mockResolvedValue({ data: { id: "ch-me" }, error: null });
    mockOperationMaybeSingle.mockResolvedValue({
      data: {
        id: "op-2",
        title: "다운타임 B",
        type: "downtime",
        status: "live",
        summary: "요약",
        is_main_story: false,
        max_participants: 8,
        created_at: "2026-02-20T00:00:00.000Z",
      },
      error: null,
    });
    mockParticipantsIs.mockResolvedValue({
      data: [
        {
          character_id: "ch-other",
          team: "static",
          character: {
            id: "ch-other",
            name: "타 참가자",
            faction: "static",
            ability_class: "compute",
            hp_current: 100,
            hp_max: 100,
            will_current: 200,
            will_max: 200,
            profile_image_url: null,
          },
        },
      ],
      error: null,
    });
    mockMessagesIs.mockResolvedValue({ data: [], error: null });

    const { GET } = await import("../route");
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ id: "op-2" }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.myParticipantId).toBeNull();
  });
});
