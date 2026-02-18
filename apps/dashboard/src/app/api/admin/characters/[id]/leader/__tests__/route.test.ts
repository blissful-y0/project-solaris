import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockRequireAdmin, mockSingle, mockUpdateEq } = vi.hoisted(() => ({
  mockRequireAdmin: vi.fn(),
  mockSingle: vi.fn(),
  mockUpdateEq: vi.fn(),
}));

vi.mock("@/lib/admin-guard", () => ({
  requireAdmin: mockRequireAdmin,
}));

describe("POST /api/admin/characters/[id]/leader", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUpdateEq.mockReturnValue({
      select: vi.fn(() => ({
        single: mockSingle,
      })),
    });

    mockRequireAdmin.mockResolvedValue({
      supabase: {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: mockSingle,
            })),
          })),
          update: vi.fn(() => ({
            eq: mockUpdateEq,
          })),
        })),
      },
      user: { id: "admin_1" },
    });
  });

  it("리더 상태를 토글한다", async () => {
    mockSingle
      .mockResolvedValueOnce({
        data: { id: "char_001", is_leader: false, status: "approved" },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { id: "char_001", is_leader: true },
        error: null,
      });

    const { POST } = await import("../route");
    const request = new Request("https://solaris.local/api/admin/characters/char_001/leader", {
      method: "POST",
    });

    const response = await POST(request, { params: { id: "char_001" } });

    expect(response.status).toBe(200);
  });

  it("승인되지 않은 캐릭터는 리더 토글을 거부한다", async () => {
    mockSingle.mockReset();
    mockSingle
      .mockResolvedValueOnce({
        data: { id: "char_001", is_leader: false, status: "pending" },
        error: null,
      });

    const { POST } = await import("../route");
    const request = new Request("https://solaris.local/api/admin/characters/char_001/leader", {
      method: "POST",
    });

    const response = await POST(request, { params: { id: "char_001" } });
    expect(response.status).toBe(400);
  });

  it("진영 리더 중복(23505)은 409로 응답한다", async () => {
    mockSingle.mockReset();
    mockSingle
      .mockResolvedValueOnce({
        data: { id: "char_001", is_leader: false, status: "approved" },
        error: null,
      })
      .mockResolvedValueOnce({
        data: null,
        error: { code: "23505" },
      });

    const { POST } = await import("../route");
    const request = new Request("https://solaris.local/api/admin/characters/char_001/leader", {
      method: "POST",
    });

    const response = await POST(request, { params: { id: "char_001" } });
    expect(response.status).toBe(409);
  });
});
