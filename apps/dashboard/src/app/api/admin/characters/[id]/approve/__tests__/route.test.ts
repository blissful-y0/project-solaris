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

describe("POST /api/admin/characters/[id]/approve", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUpdateEq.mockReturnValue({
      select: vi.fn(() => ({
        single: mockSingle,
      })),
    });

    mockSingle.mockResolvedValue({
      data: { id: "char_001", user_id: "user_1", status: "approved" },
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

  it("캐릭터를 승인하고 개인 알림을 생성한다", async () => {
    const { POST } = await import("../route");
    const request = new Request("https://solaris.local/api/admin/characters/char_001/approve", {
      method: "POST",
    });

    const response = await POST(request, { params: { id: "char_001" } });

    expect(response.status).toBe(200);
    expect(mockCreateNotification).toHaveBeenCalled();
  });
});
