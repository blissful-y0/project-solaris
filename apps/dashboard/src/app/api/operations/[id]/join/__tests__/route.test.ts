import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockCreateClient,
  mockGetUser,
  mockFrom,
  mockRpc,
  mockCharacterMaybeSingle,
  mockOperationMaybeSingle,
  mockParticipantMaybeSingle,
  mockInsert,
  mockInsertSelectSingle,
} = vi.hoisted(() => ({
  mockCreateClient: vi.fn(),
  mockGetUser: vi.fn(),
  mockFrom: vi.fn(),
  mockRpc: vi.fn(),
  mockCharacterMaybeSingle: vi.fn(),
  mockOperationMaybeSingle: vi.fn(),
  mockParticipantMaybeSingle: vi.fn(),
  mockInsert: vi.fn(),
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
      rpc: mockRpc,
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
          insert: mockInsert,
        };
      }

      throw new Error(`unexpected table: ${table}`);
    });

    mockRpc.mockResolvedValue({
      data: { state: "joined", participant_id: "opp-new", team: "bureau", role: "member" },
      error: null,
    });
    mockInsert.mockImplementation(() => ({
      select: () => ({
        single: mockInsertSelectSingle,
      }),
    }));
    mockInsertSelectSingle.mockResolvedValue({
      data: { id: "opp-legacy", team: "bureau", role: "member" },
      error: null,
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
    mockCharacterMaybeSingle.mockResolvedValue({ data: { id: "ch-1", faction: "bureau" }, error: null });
    mockOperationMaybeSingle.mockResolvedValue({
      data: { id: "op-1", type: "downtime", status: "waiting", max_participants: 8, created_by: "ch-host" },
      error: null,
    });
    mockParticipantMaybeSingle.mockResolvedValue({
      data: { id: "opp-1", team: "bureau", role: "member" },
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
    mockCharacterMaybeSingle.mockResolvedValue({ data: { id: "ch-1", faction: "bureau" }, error: null });
    mockOperationMaybeSingle.mockResolvedValue({
      data: { id: "op-1", type: "downtime", status: "waiting", max_participants: 8, created_by: "ch-host" },
      error: null,
    });
    mockParticipantMaybeSingle.mockResolvedValue({ data: null, error: null });
    const { POST } = await import("../route");
    const response = await POST(new Request("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ id: "op-1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.data).toEqual(
      expect.objectContaining({
        alreadyJoined: false,
        team: "bureau",
      }),
    );
  });

  it("동시 요청으로 unique 충돌이 나도 이미 참가로 처리한다", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockCharacterMaybeSingle.mockResolvedValue({ data: { id: "ch-1", faction: "bureau" }, error: null });
    mockOperationMaybeSingle.mockResolvedValue({
      data: { id: "op-1", type: "downtime", status: "waiting", max_participants: 8, created_by: "ch-host" },
      error: null,
    });
    mockParticipantMaybeSingle
      .mockResolvedValueOnce({ data: null, error: null })
      .mockResolvedValueOnce({
        data: { id: "opp-1", team: "bureau", role: "member" },
        error: null,
      });
    mockRpc.mockResolvedValue({
      data: null,
      error: { code: "23505", message: "duplicate key value violates unique constraint" },
    });

    const { POST } = await import("../route");
    const response = await POST(new Request("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ id: "op-1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual(
      expect.objectContaining({
        participantId: "opp-1",
        alreadyJoined: true,
      }),
    );
  });

  it("RPC에서 already_joined를 반환하면 200으로 처리한다", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockCharacterMaybeSingle.mockResolvedValue({ data: { id: "ch-1", faction: "bureau" }, error: null });
    mockOperationMaybeSingle.mockResolvedValue({
      data: { id: "op-1", type: "downtime", status: "waiting", max_participants: 8, created_by: "ch-host" },
      error: null,
    });
    mockParticipantMaybeSingle.mockResolvedValue({ data: null, error: null });
    mockRpc.mockResolvedValue({
      data: { state: "already_joined", participant_id: "opp-1", team: "bureau", role: "member" },
      error: null,
    });

    const { POST } = await import("../route");
    const response = await POST(new Request("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ id: "op-1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual(
      expect.objectContaining({
        participantId: "opp-1",
        alreadyJoined: true,
      }),
    );
  });

  it("OPERATION 생성자가 입장하면 bureau 팀으로 들어간다", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockCharacterMaybeSingle.mockResolvedValue({ data: { id: "ch-host", faction: "bureau" }, error: null });
    mockOperationMaybeSingle.mockResolvedValue({
      data: { id: "op-1", type: "operation", status: "waiting", max_participants: 4, created_by: "ch-host" },
      error: null,
    });
    mockParticipantMaybeSingle.mockResolvedValue({ data: null, error: null });
    const { POST } = await import("../route");
    const response = await POST(new Request("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ id: "op-1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.data.team).toBe("bureau");
    expect(mockRpc).toHaveBeenCalledWith("join_operation_participant",
      expect.objectContaining({
        p_operation_id: "op-1",
        p_character_id: "ch-host",
        p_team: "bureau",
      }),
    );
  });

  it("DOWNTIME 생성자가 입장해도 bureau 팀으로 저장한다", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockCharacterMaybeSingle.mockResolvedValue({ data: { id: "ch-host", faction: "bureau" }, error: null });
    mockOperationMaybeSingle.mockResolvedValue({
      data: { id: "op-1", type: "downtime", status: "waiting", max_participants: 8, created_by: "ch-host" },
      error: null,
    });
    mockParticipantMaybeSingle.mockResolvedValue({ data: null, error: null });
    const { POST } = await import("../route");
    const response = await POST(new Request("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ id: "op-1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.data.team).toBe("bureau");
    expect(mockRpc).toHaveBeenCalledWith("join_operation_participant",
      expect.objectContaining({
        p_operation_id: "op-1",
        p_character_id: "ch-host",
        p_team: "bureau",
      }),
    );
  });

  it("OPERATION에서 static 계열 캐릭터는 static 팀으로 저장한다", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockCharacterMaybeSingle.mockResolvedValue({ data: { id: "ch-static", faction: "static" }, error: null });
    mockOperationMaybeSingle.mockResolvedValue({
      data: { id: "op-1", type: "operation", status: "waiting", max_participants: 4, created_by: "ch-host" },
      error: null,
    });
    mockParticipantMaybeSingle.mockResolvedValue({ data: null, error: null });
    mockRpc.mockResolvedValue({
      data: { state: "joined", participant_id: "opp-new", team: "static", role: "member" },
      error: null,
    });

    const { POST } = await import("../route");
    const response = await POST(new Request("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ id: "op-1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.data.team).toBe("static");
    expect(mockRpc).toHaveBeenCalledWith("join_operation_participant",
      expect.objectContaining({
        p_operation_id: "op-1",
        p_character_id: "ch-static",
        p_team: "static",
      }),
    );
  });

  it("미지원 faction이면 422를 반환한다", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockCharacterMaybeSingle.mockResolvedValue({ data: { id: "ch-1", faction: "civilian" }, error: null });
    mockOperationMaybeSingle.mockResolvedValue({
      data: { id: "op-1", type: "operation", status: "waiting", created_by: "ch-host" },
      error: null,
    });
    mockParticipantMaybeSingle.mockResolvedValue({ data: null, error: null });

    const { POST } = await import("../route");
    const response = await POST(new Request("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ id: "op-1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body).toEqual({ error: "INVALID_FACTION" });
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it("완료된 작전에는 참가할 수 없다 (409)", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockCharacterMaybeSingle.mockResolvedValue({ data: { id: "ch-1", faction: "bureau" }, error: null });
    mockOperationMaybeSingle.mockResolvedValue({
      data: { id: "op-1", type: "operation", status: "completed", created_by: "ch-host" },
      error: null,
    });

    const { POST } = await import("../route");
    const response = await POST(new Request("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ id: "op-1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body).toEqual({ error: "OPERATION_CLOSED" });
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it("정원이 가득 찬 작전에는 참가할 수 없다 (409)", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockCharacterMaybeSingle.mockResolvedValue({ data: { id: "ch-1", faction: "bureau" }, error: null });
    mockOperationMaybeSingle.mockResolvedValue({
      data: { id: "op-1", type: "operation", status: "waiting", created_by: "ch-host" },
      error: null,
    });
    mockParticipantMaybeSingle.mockResolvedValue({ data: null, error: null });
    mockRpc.mockResolvedValue({
      data: { state: "operation_full" },
      error: null,
    });

    const { POST } = await import("../route");
    const response = await POST(new Request("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ id: "op-1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body).toEqual({ error: "OPERATION_FULL" });
  });

  it("RPC가 OPERATION_FULL 예외를 반환하면 409로 매핑한다", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockCharacterMaybeSingle.mockResolvedValue({ data: { id: "ch-1", faction: "bureau" }, error: null });
    mockOperationMaybeSingle.mockResolvedValue({
      data: { id: "op-1", type: "operation", status: "waiting", created_by: "ch-host" },
      error: null,
    });
    mockParticipantMaybeSingle.mockResolvedValue({ data: null, error: null });
    mockRpc.mockResolvedValue({
      data: null,
      error: { message: "OPERATION_FULL" },
    });

    const { POST } = await import("../route");
    const response = await POST(new Request("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ id: "op-1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body).toEqual({ error: "OPERATION_FULL" });
  });

  it("RPC 함수가 아직 없으면 legacy insert 경로로 폴백한다", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockCharacterMaybeSingle.mockResolvedValue({ data: { id: "ch-1", faction: "bureau" }, error: null });
    mockOperationMaybeSingle.mockResolvedValue({
      data: { id: "op-1", type: "downtime", status: "waiting", max_participants: 8, created_by: "ch-host" },
      error: null,
    });
    mockParticipantMaybeSingle.mockResolvedValue({ data: null, error: null });
    mockRpc.mockResolvedValue({
      data: null,
      error: { code: "42883", message: "function join_operation_participant does not exist" },
    });
    mockInsertSelectSingle.mockResolvedValue({
      data: { id: "opp-legacy", team: "bureau", role: "member" },
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
        participantId: "opp-legacy",
        alreadyJoined: false,
      }),
    );
    expect(mockInsert).toHaveBeenCalled();
  });
});
