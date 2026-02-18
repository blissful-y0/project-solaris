import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockRequireAdmin, mockOrder } = vi.hoisted(() => ({
  mockRequireAdmin: vi.fn(),
  mockOrder: vi.fn(),
}));

vi.mock("@/lib/admin-guard", () => ({
  requireAdmin: mockRequireAdmin,
}));

describe("GET /api/admin/characters/queue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOrder.mockResolvedValue({
      data: [{ id: "char_001", status: "pending" }],
      error: null,
    });

    mockRequireAdmin.mockResolvedValue({
      supabase: {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: mockOrder,
            })),
          })),
        })),
      },
      user: { id: "admin_1" },
    });
  });

  it("승인 대기 캐릭터 목록을 반환한다", async () => {
    const { GET } = await import("../route");
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual([{ id: "char_001", status: "pending" }]);
  });
});
