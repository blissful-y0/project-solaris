import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockCreateClient, mockGetUser, mockFrom, mockRpc } = vi.hoisted(() => ({
  mockCreateClient: vi.fn(),
  mockGetUser: vi.fn(),
  mockFrom: vi.fn(),
  mockRpc: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mockCreateClient,
}));

describe("POST /api/operation/encounters/[id]/resolve", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("미인증이면 401", async () => {
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    });

    const { POST } = await import("../route");
    const request = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ turn_id: "ot_1", idempotency_key: "idem-12345678" }),
    });

    const response = await POST(request as never, {
      params: Promise.resolve({ id: "enc_1" }),
    });

    expect(response.status).toBe(401);
  });

  it("정상 resolve면 200", async () => {
    const participants = [
      { character_id: "A", team: "alpha", submission_order: 1 },
      { character_id: "B", team: "beta", submission_order: 2 },
    ];
    const submissions = [
      {
        id: "os_1",
        turn_id: "ot_1",
        participant_character_id: "A",
        ability_id: "ab_1",
        ability_tier: "advanced",
        action_type: "attack",
        target_character_id: "B",
        target_stat: "hp",
        base_damage: 20,
        multiplier: 1,
        cost_hp: 0,
        cost_will: 10,
        narrative: null,
        is_auto_fail: false,
        submitted_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "os_2",
        turn_id: "ot_1",
        participant_character_id: "B",
        ability_id: "ab_2",
        ability_tier: "basic",
        action_type: "attack",
        target_character_id: "A",
        target_stat: "hp",
        base_damage: 20,
        multiplier: 1,
        cost_hp: 10,
        cost_will: 0,
        narrative: null,
        is_auto_fail: false,
        submitted_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    const characterRows: Record<string, { hp_current: number; will_current: number }> = {
      A: { hp_current: 100, will_current: 100 },
      B: { hp_current: 100, will_current: 100 },
    };

    mockGetUser.mockResolvedValue({ data: { user: { id: "user_1" } } });

    mockFrom.mockImplementation((table: string) => {
      if (table === "operation_turns") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                single: vi.fn().mockResolvedValue({
                  data: { id: "ot_1", encounter_id: "enc_1", turn_number: 1, status: "ready" },
                  error: null,
                }),
              }),
            }),
          }),
        };
      }

      if (table === "operation_encounter_participants") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                order: vi.fn().mockResolvedValue({ data: participants, error: null }),
              }),
            }),
          }),
        };
      }

      if (table === "operation_turn_submissions") {
        return {
          select: () => ({
            eq: vi.fn().mockResolvedValue({ data: submissions, error: null }),
          }),
          upsert: vi.fn().mockResolvedValue({ error: null }),
        };
      }

      if (table === "characters") {
        return {
          select: () => ({
            eq: (_: string, id: string) => ({
              single: vi.fn().mockResolvedValue({
                data: { id, ...characterRows[id] },
                error: null,
              }),
            }),
          }),
        };
      }

      throw new Error(`unexpected table ${table}`);
    });

    mockRpc.mockResolvedValue({ data: { ok: true }, error: null });

    mockCreateClient.mockResolvedValue({
      auth: { getUser: mockGetUser },
      from: mockFrom,
      rpc: mockRpc,
    });

    const { POST } = await import("../route");
    const request = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({
        turn_id: "ot_1",
        idempotency_key: "idem-12345678",
      }),
    });

    const response = await POST(request as never, {
      params: Promise.resolve({ id: "enc_1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.turn_id).toBe("ot_1");
    expect(mockRpc).toHaveBeenCalledWith("apply_operation_resolution", expect.any(Object));
  });
});
