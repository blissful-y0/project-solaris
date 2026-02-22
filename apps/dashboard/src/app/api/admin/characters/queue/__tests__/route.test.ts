import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockRequireAdmin, mockRange } = vi.hoisted(() => ({
  mockRequireAdmin: vi.fn(),
  mockRange: vi.fn(),
}));

vi.mock("@/lib/admin-guard", () => ({
  requireAdmin: mockRequireAdmin,
}));

describe("GET /api/admin/characters/queue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRange.mockResolvedValue({
      data: [{ id: "char_001", status: "pending" }],
      error: null,
    });

    mockRequireAdmin.mockResolvedValue({
      supabase: {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => ({
                range: mockRange,
              })),
            })),
          })),
        })),
      },
      user: { id: "admin_1" },
    });
  });

  it("승인 대기 캐릭터 목록을 반환한다", async () => {
    const { GET } = await import("../route");
    const { NextRequest } = await import("next/server");
    const request = new NextRequest("http://localhost/api/admin/characters/queue");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual([{ id: "char_001", status: "pending" }]);
  });
});
