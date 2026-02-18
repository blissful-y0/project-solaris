import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockCreateClient,
  mockGetUser,
  mockFrom,
  mockSingleUpdate,
  mockBulkUpdate,
} = vi.hoisted(() => ({
  mockCreateClient: vi.fn(),
  mockGetUser: vi.fn(),
  mockFrom: vi.fn(),
  mockSingleUpdate: vi.fn(),
  mockBulkUpdate: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mockCreateClient,
}));

describe("POST /api/notifications/read", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockCreateClient.mockResolvedValue({
      auth: { getUser: mockGetUser },
      from: mockFrom,
    });

    mockSingleUpdate.mockResolvedValue({ error: null });
    mockBulkUpdate.mockResolvedValue({ error: null });

    mockFrom.mockReturnValue({
      update: vi.fn(() => ({
        eq: vi.fn((column: string) => {
          if (column === "id") {
            return {
              eq: vi.fn(() => mockSingleUpdate()),
            };
          }

          return {
            eq: vi.fn(() => ({
              is: vi.fn(() => mockBulkUpdate()),
            })),
          };
        }),
      })),
    });
  });

  it("notificationId가 있으면 단건 read_at을 갱신한다", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "1ab4a2b5-15e7-49ef-9108-ecc2ad850a08" } },
    });

    const { POST } = await import("../route");
    const request = new Request("https://solaris.local/api/notifications/read", {
      method: "POST",
      body: JSON.stringify({ notificationId: "notif_001" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
  });

  it("all=true면 미읽음 전체 read_at을 갱신한다", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "1ab4a2b5-15e7-49ef-9108-ecc2ad850a08" } },
    });

    const { POST } = await import("../route");
    const request = new Request("https://solaris.local/api/notifications/read", {
      method: "POST",
      body: JSON.stringify({ all: true }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
  });
});
