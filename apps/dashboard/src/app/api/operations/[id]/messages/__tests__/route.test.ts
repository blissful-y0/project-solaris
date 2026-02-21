import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockCreateClient,
  mockGetUser,
  mockFrom,
  mockCharacterMaybeSingle,
  mockOperationMaybeSingle,
  mockParticipantMaybeSingle,
  mockInsertSelectSingle,
} = vi.hoisted(() => ({
  mockCreateClient: vi.fn(),
  mockGetUser: vi.fn(),
  mockFrom: vi.fn(),
  mockCharacterMaybeSingle: vi.fn(),
  mockOperationMaybeSingle: vi.fn(),
  mockParticipantMaybeSingle: vi.fn(),
  mockInsertSelectSingle: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mockCreateClient,
}));

describe("POST /api/operations/[id]/messages", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockCreateClient.mockResolvedValue({
      auth: { getUser: mockGetUser },
      from: mockFrom,
    });

    mockFrom.mockImplementation((table: string) => {
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

      if (table === "operation_messages") {
        return {
          insert: () => ({
            select: () => ({
              single: mockInsertSelectSingle,
            }),
          }),
        };
      }

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
              eq: () => ({
                is: () => ({
                  maybeSingle: mockParticipantMaybeSingle,
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

    const { POST } = await import("../route");
    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ content: "안녕하세요" }),
      }),
      { params: Promise.resolve({ id: "op-1" }) },
    );

    expect(response.status).toBe(401);
  });

  it("빈 content면 400", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });

    const { POST } = await import("../route");
    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ content: "   " }),
      }),
      { params: Promise.resolve({ id: "op-1" }) },
    );

    expect(response.status).toBe(400);
  });

  it("정상 전송이면 201", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockCharacterMaybeSingle.mockResolvedValue({
      data: {
        id: "ch-1",
        name: "루시엘",
        profile_image_url: null,
      },
      error: null,
    });
    mockInsertSelectSingle.mockResolvedValue({
      data: {
        id: "msg-1",
        type: "narration",
        content: "테스트 전송",
        created_at: "2026-02-20T00:00:00.000Z",
        sender_character_id: "ch-1",
        sender: {
          id: "ch-1",
          name: "루시엘",
          profile_image_url: null,
        },
      },
      error: null,
    });
    mockOperationMaybeSingle.mockResolvedValue({
      data: { id: "op-1", status: "live" },
      error: null,
    });
    mockParticipantMaybeSingle.mockResolvedValue({
      data: { id: "opp-1" },
      error: null,
    });

    const { POST } = await import("../route");
    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ content: "테스트 전송" }),
      }),
      { params: Promise.resolve({ id: "op-1" }) },
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.data).toEqual(
      expect.objectContaining({
        id: "msg-1",
        content: "테스트 전송",
        senderId: "ch-1",
        isMine: true,
      }),
    );
  });

  it("비참가자는 403", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockCharacterMaybeSingle.mockResolvedValue({
      data: { id: "ch-1", name: "루시엘", profile_image_url: null },
      error: null,
    });
    mockOperationMaybeSingle.mockResolvedValue({
      data: { id: "op-1", status: "live" },
      error: null,
    });
    mockParticipantMaybeSingle.mockResolvedValue({
      data: null,
      error: null,
    });

    const { POST } = await import("../route");
    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ content: "테스트 전송" }),
      }),
      { params: Promise.resolve({ id: "op-1" }) },
    );

    expect(response.status).toBe(403);
  });

  it("완료된 operation은 409", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockCharacterMaybeSingle.mockResolvedValue({
      data: { id: "ch-1", name: "루시엘", profile_image_url: null },
      error: null,
    });
    mockOperationMaybeSingle.mockResolvedValue({
      data: { id: "op-1", status: "completed" },
      error: null,
    });

    const { POST } = await import("../route");
    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ content: "테스트 전송" }),
      }),
      { params: Promise.resolve({ id: "op-1" }) },
    );

    expect(response.status).toBe(409);
  });
});
