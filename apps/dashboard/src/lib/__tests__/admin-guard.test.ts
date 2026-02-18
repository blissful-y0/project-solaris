import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockCreateClient, mockGetUser, mockSingle } = vi.hoisted(() => ({
  mockCreateClient: vi.fn(),
  mockGetUser: vi.fn(),
  mockSingle: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mockCreateClient,
}));

describe("requireAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateClient.mockResolvedValue({
      auth: { getUser: mockGetUser },
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: mockSingle,
          })),
        })),
      })),
    });
  });

  it("미인증 사용자는 예외를 던진다", async () => {
    const { requireAdmin } = await import("../admin-guard");
    mockGetUser.mockResolvedValue({ data: { user: null } });

    await expect(requireAdmin()).rejects.toThrow("UNAUTHENTICATED");
  });

  it("관리자가 아니면 예외를 던진다", async () => {
    const { requireAdmin } = await import("../admin-guard");
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    mockSingle.mockResolvedValue({ data: { role: "user" }, error: null });

    await expect(requireAdmin()).rejects.toThrow("FORBIDDEN");
  });

  it("관리자면 supabase와 user를 반환한다", async () => {
    const { requireAdmin } = await import("../admin-guard");
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    mockSingle.mockResolvedValue({ data: { role: "admin" }, error: null });

    const result = await requireAdmin();
    expect(result.user.id).toBe("u1");
  });
});
