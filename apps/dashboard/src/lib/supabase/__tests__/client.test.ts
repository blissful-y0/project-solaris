import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockCreateBrowserClient } = vi.hoisted(() => ({
  mockCreateBrowserClient: vi.fn(),
}));

const ORIGINAL_ENV = { ...process.env };

vi.mock("@supabase/ssr", () => ({
  createBrowserClient: mockCreateBrowserClient,
}));

describe("createClient", () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    vi.resetModules();
    vi.clearAllMocks();
    mockCreateBrowserClient.mockReturnValue({ __client: "mock" });
  });

  it("여러 번 호출해도 동일 인스턴스를 반환한다", async () => {
    const { createClient } = await import("../client");

    const first = createClient();
    const second = createClient();

    expect(first).toBe(second);
    expect(mockCreateBrowserClient).toHaveBeenCalledTimes(1);
  });
});
