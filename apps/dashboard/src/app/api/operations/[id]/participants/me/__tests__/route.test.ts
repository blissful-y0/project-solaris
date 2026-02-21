import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockCreateClient,
  mockGetUser,
  mockFrom,
  mockCharacterMaybeSingle,
  mockParticipantMaybeSingle,
  mockParticipantUpdate,
} = vi.hoisted(() => ({
  mockCreateClient: vi.fn(),
  mockGetUser: vi.fn(),
  mockFrom: vi.fn(),
  mockCharacterMaybeSingle: vi.fn(),
  mockParticipantMaybeSingle: vi.fn(),
  mockParticipantUpdate: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mockCreateClient,
}));

describe("DELETE /api/operations/[id]/participants/me", () => {
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
          update: () => ({
            eq: () => ({
              is: mockParticipantUpdate,
            }),
          }),
        };
      }

      throw new Error(`unexpected table: ${table}`);
    });
  });

  it("미인증이면 401", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const { DELETE } = await import("../route");
    const response = await DELETE(new Request("http://localhost", { method: "DELETE" }), {
      params: Promise.resolve({ id: "op-1" }),
    });

    expect(response.status).toBe(401);
  });

  it("참가 기록이 없으면 left=false", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockCharacterMaybeSingle.mockResolvedValue({ data: { id: "ch-1" }, error: null });
    mockParticipantMaybeSingle.mockResolvedValue({ data: null, error: null });

    const { DELETE } = await import("../route");
    const response = await DELETE(new Request("http://localhost", { method: "DELETE" }), {
      params: Promise.resolve({ id: "op-1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.left).toBe(false);
  });

  it("참가중이면 soft delete 처리", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockCharacterMaybeSingle.mockResolvedValue({ data: { id: "ch-1" }, error: null });
    mockParticipantMaybeSingle.mockResolvedValue({ data: { id: "opp-1" }, error: null });
    mockParticipantUpdate.mockResolvedValue({ error: null });

    const { DELETE } = await import("../route");
    const response = await DELETE(new Request("http://localhost", { method: "DELETE" }), {
      params: Promise.resolve({ id: "op-1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.left).toBe(true);
  });
});
