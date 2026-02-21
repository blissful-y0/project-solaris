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
      data: { id: "char_001", user_id: "user_1", status: "rejected", name: "아마츠키 레이" },
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
      body: JSON.stringify({ reason: "능력 코스트가 불균형합니다. 기본기 코스트를 재조정해 주세요." }),
    });

    const response = await POST(request, { params: { id: "char_001" } });

    expect(response.status).toBe(200);
    expect(mockCreateNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "[SOLARIS] 캐릭터 반려 안내",
        body: expect.stringContaining("아마츠키 레이"),
      }),
      expect.anything(),
    );
  });

  it("알림 생성 실패해도 반려 자체는 200으로 응답한다", async () => {
    mockCreateNotification.mockRejectedValueOnce(new Error("INSERT_FAILED"));

    const { POST } = await import("../route");
    const request = new Request("https://solaris.local/api/admin/characters/char_001/reject", {
      method: "POST",
      body: JSON.stringify({ reason: "능력 코스트가 불균형합니다. 기본기 코스트를 재조정해 주세요." }),
    });

    const response = await POST(request, { params: { id: "char_001" } });
    expect(response.status).toBe(200);
  });
});
