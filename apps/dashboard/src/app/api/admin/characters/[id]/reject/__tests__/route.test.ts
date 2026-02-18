import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockRequireAdmin, mockCreateNotification, mockSingle, mockUpdateEq } =
  vi.hoisted(() => ({
    mockRequireAdmin: vi.fn(),
    mockCreateNotification: vi.fn(),
    mockSingle: vi.fn(),
    mockUpdateEq: vi.fn(),
  }));

vi.mock("@/lib/admin-guard", () => ({
  requireAdmin: mockRequireAdmin,
}));

vi.mock("@/app/actions/notification", () => ({
  createNotification: mockCreateNotification,
}));

describe("POST /api/admin/characters/[id]/reject", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUpdateEq.mockReturnValue({
      select: vi.fn(() => ({
        single: mockSingle,
      })),
    });

    mockSingle.mockResolvedValue({
      data: { id: "char_001", user_id: "user_1", status: "rejected" },
      error: null,
    });

    mockRequireAdmin.mockResolvedValue({
      supabase: {
        from: vi.fn(() => ({
          update: vi.fn(() => ({
            eq: mockUpdateEq,
          })),
        })),
      },
      user: { id: "admin_1" },
    });

    mockCreateNotification.mockResolvedValue(undefined);
  });

  it("캐릭터를 반려하고 개인 알림을 생성한다", async () => {
    const { POST } = await import("../route");
    const request = new Request("https://solaris.local/api/admin/characters/char_001/reject", {
      method: "POST",
      body: JSON.stringify({ reason: "형식 불일치" }),
    });

    const response = await POST(request, { params: { id: "char_001" } });

    expect(response.status).toBe(200);
    expect(mockCreateNotification).toHaveBeenCalled();
  });

  it("내부 오류는 FORBIDDEN이 아니라 500으로 응답한다", async () => {
    mockCreateNotification.mockRejectedValueOnce(new Error("INSERT_FAILED"));

    const { POST } = await import("../route");
    const request = new Request("https://solaris.local/api/admin/characters/char_001/reject", {
      method: "POST",
      body: JSON.stringify({ reason: "형식 불일치" }),
    });

    const response = await POST(request, { params: { id: "char_001" } });
    expect(response.status).toBe(500);
  });
});
