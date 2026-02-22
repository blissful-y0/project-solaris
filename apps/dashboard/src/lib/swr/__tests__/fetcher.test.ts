import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockApiFetch } = vi.hoisted(() => ({
  mockApiFetch: vi.fn(),
}));

vi.mock("@/lib/api/fetch", () => ({
  apiFetch: mockApiFetch,
}));

import { ApiFetchError, isApiFetchError, swrFetcher } from "../fetcher";

describe("swrFetcher", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("성공 응답을 그대로 반환한다", async () => {
    mockApiFetch.mockResolvedValue({
      ok: true,
      data: { value: 1 },
      status: 200,
    });

    const result = await swrFetcher<{ value: number }>("/api/test");

    expect(result).toEqual({ value: 1 });
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/api/test",
      expect.objectContaining({ skipGlobalLoading: true }),
    );
  });

  it("실패 응답이면 ApiFetchError를 throw한다", async () => {
    mockApiFetch.mockResolvedValue({
      ok: false,
      error: "FORBIDDEN",
      status: 403,
    });

    await expect(swrFetcher("/api/test")).rejects.toMatchObject({
      name: "ApiFetchError",
      code: "FORBIDDEN",
      status: 403,
    });
  });
});

describe("isApiFetchError", () => {
  it("ApiFetchError를 정확히 식별한다", () => {
    expect(isApiFetchError(new ApiFetchError("FORBIDDEN", 403))).toBe(true);
    expect(isApiFetchError(new Error("x"))).toBe(false);
    expect(isApiFetchError({ code: "FORBIDDEN", status: 403 })).toBe(false);
  });
});
