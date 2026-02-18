import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockCreateClient, mockGetUser, mockFrom, mockLimit } = vi.hoisted(() => ({
  mockCreateClient: vi.fn(),
  mockGetUser: vi.fn(),
  mockFrom: vi.fn(),
  mockLimit: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mockCreateClient,
}));

describe("GET /api/notifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateClient.mockResolvedValue({
      auth: { getUser: mockGetUser },
      from: mockFrom,
    });

    mockLimit.mockResolvedValue({
      data: [{ id: "notif_001", title: "알림" }],
      error: null,
    });

    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: mockLimit,
            })),
          })),
        })),
      })),
    });
  });

  it("미인증 사용자는 401을 반환한다", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const { GET } = await import("../route");
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("UNAUTHENTICATED");
  });

  it("인증 사용자는 본인 알림 목록을 반환한다", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "1ab4a2b5-15e7-49ef-9108-ecc2ad850a08" } },
    });

    const { GET } = await import("../route");
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual([{ id: "notif_001", title: "알림" }]);
  });
});
