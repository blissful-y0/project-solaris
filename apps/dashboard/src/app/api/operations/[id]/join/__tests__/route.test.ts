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

describe("POST /api/operations/[id]/join", () => {
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
          insert: () => ({
            select: () => ({
              single: mockInsertSelectSingle,
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
    const response = await POST(new Request("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ id: "op-1" }),
    });

    expect(response.status).toBe(401);
  });

  it("이미 참가했으면 200", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockCharacterMaybeSingle.mockResolvedValue({ data: { id: "ch-1" }, error: null });
    mockOperationMaybeSingle.mockResolvedValue({
      data: { id: "op-1", type: "downtime", created_by: "ch-host" },
      error: null,
    });
    mockParticipantMaybeSingle.mockResolvedValue({
      data: { id: "opp-1", team: "ally", role: "member" },
      error: null,
    });

    const { POST } = await import("../route");
    const response = await POST(new Request("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ id: "op-1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.alreadyJoined).toBe(true);
  });

  it("신규 참가면 201", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockCharacterMaybeSingle.mockResolvedValue({ data: { id: "ch-1" }, error: null });
    mockOperationMaybeSingle.mockResolvedValue({
      data: { id: "op-1", type: "downtime", created_by: "ch-host" },
      error: null,
    });
    mockParticipantMaybeSingle.mockResolvedValue({ data: null, error: null });
    mockInsertSelectSingle.mockResolvedValue({
      data: { id: "opp-new", team: "ally", role: "member" },
      error: null,
    });

    const { POST } = await import("../route");
    const response = await POST(new Request("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ id: "op-1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.data).toEqual(
      expect.objectContaining({
        alreadyJoined: false,
        team: "ally",
      }),
    );
  });
});
