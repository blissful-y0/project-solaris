import { describe, expect, it, vi, beforeEach } from "vitest";

const { mockCreateClient, mockGetUser, mockRpc } = vi.hoisted(() => ({
  mockCreateClient: vi.fn(),
  mockGetUser: vi.fn(),
  mockRpc: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mockCreateClient,
}));

describe("POST /api/operation/encounters/[id]/submissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: mockGetUser,
      },
      rpc: mockRpc,
    });
  });

  it("미인증이면 401", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const { POST } = await import("../route");
    const request = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({
        ability_id: "ab1",
        action_type: "attack",
        base_damage: 20,
        multiplier: 1,
      }),
    });

    const response = await POST(request as never, {
      params: Promise.resolve({ id: "enc_1" }),
    });

    expect(response.status).toBe(401);
  });

  it("정상 제출이면 201", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user_1" } } });
    mockRpc.mockResolvedValue({ data: { turn_id: "ot_1" }, error: null });

    const { POST } = await import("../route");
    const request = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({
        ability_id: "ab1",
        action_type: "attack",
        target_character_id: "char_2",
        target_stat: "hp",
        base_damage: 20,
        multiplier: 1,
      }),
    });

    const response = await POST(request as never, {
      params: Promise.resolve({ id: "enc_1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.data.turn_id).toBe("ot_1");
    expect(mockRpc).toHaveBeenCalledWith("submit_operation_action", expect.any(Object));
  });
});
