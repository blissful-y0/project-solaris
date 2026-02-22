import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockRequireAdmin, mockFrom, mockRpc } = vi.hoisted(() => ({
  mockRequireAdmin: vi.fn(),
  mockFrom: vi.fn(),
  mockRpc: vi.fn(),
}));

vi.mock("@/lib/admin-guard", () => ({
  requireAdmin: mockRequireAdmin,
}));

describe("POST /api/operation/encounters/[id]/resolve", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("미인증이면 401", async () => {
    mockRequireAdmin.mockRejectedValue(new Error("UNAUTHENTICATED"));

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

  it("관리자가 아니면 403", async () => {
    mockRequireAdmin.mockRejectedValue(new Error("FORBIDDEN"));

    const { POST } = await import("../route");
    const request = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ turn_id: "ot_1", idempotency_key: "idem-12345678" }),
    });

    const response = await POST(request as never, {
      params: Promise.resolve({ id: "enc_1" }),
    });

    expect(response.status).toBe(403);
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

    mockRequireAdmin.mockResolvedValue({
      supabase: { from: mockFrom, rpc: mockRpc },
      user: { id: "user_1" },
    });

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
            in: vi.fn().mockResolvedValue({
              data: Object.entries(characterRows).map(([id, stats]) => ({ id, ...stats })),
              error: null,
            }),
          }),
        };
      }

      throw new Error(`unexpected table ${table}`);
    });

    mockRpc.mockResolvedValue({ data: { ok: true }, error: null });

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

  it("요청 payload의 judgement actions를 우선 적용한다", async () => {
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
    ];

    mockRequireAdmin.mockResolvedValue({
      supabase: { from: mockFrom, rpc: mockRpc },
      user: { id: "user_1" },
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === "operation_turns") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                single: vi.fn().mockResolvedValue({
                  data: {
                    id: "ot_1",
                    encounter_id: "enc_1",
                    turn_number: 1,
                    status: "ready",
                    judgement: {
                      actions: [{ actor_id: "A", multiplier: 3 }],
                    },
                  },
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
            in: vi.fn().mockResolvedValue({
              data: [
                { id: "A", hp_current: 100, will_current: 100 },
                { id: "B", hp_current: 100, will_current: 100 },
              ],
              error: null,
            }),
          }),
        };
      }

      throw new Error(`unexpected table ${table}`);
    });

    mockRpc.mockResolvedValue({ data: { ok: true }, error: null });

    const { POST } = await import("../route");
    const request = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({
        turn_id: "ot_1",
        idempotency_key: "idem-12345678",
        judgement: {
          actions: [{ actor_id: "A", multiplier: 0.5 }],
        },
      }),
    });

    const response = await POST(request as never, {
      params: Promise.resolve({ id: "enc_1" }),
    });

    const rpcPayload = mockRpc.mock.calls[0][1] as {
      p_action_results: Array<{ actorId: string; multiplier: number }>;
    };
    const actorAResult = rpcPayload.p_action_results.find((action) => action.actorId === "A");

    expect(response.status).toBe(200);
    expect(actorAResult?.multiplier).toBe(0.5);
  });

  it("payload judgement가 없으면 turn judgement를 사용한다", async () => {
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
    ];

    mockRequireAdmin.mockResolvedValue({
      supabase: { from: mockFrom, rpc: mockRpc },
      user: { id: "user_1" },
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === "operation_turns") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                single: vi.fn().mockResolvedValue({
                  data: {
                    id: "ot_1",
                    encounter_id: "enc_1",
                    turn_number: 1,
                    status: "ready",
                    judgement: {
                      actions: [{ actor_id: "A", multiplier: 0.25 }],
                    },
                  },
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
            in: vi.fn().mockResolvedValue({
              data: [
                { id: "A", hp_current: 100, will_current: 100 },
                { id: "B", hp_current: 100, will_current: 100 },
              ],
              error: null,
            }),
          }),
        };
      }

      throw new Error(`unexpected table ${table}`);
    });

    mockRpc.mockResolvedValue({ data: { ok: true }, error: null });

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

    const rpcPayload = mockRpc.mock.calls[0][1] as {
      p_action_results: Array<{ actorId: string; multiplier: number }>;
    };
    const actorAResult = rpcPayload.p_action_results.find((action) => action.actorId === "A");

    expect(response.status).toBe(200);
    expect(actorAResult?.multiplier).toBe(0.25);
  });
});
