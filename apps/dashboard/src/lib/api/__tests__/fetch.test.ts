import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { apiFetch } from "../fetch";

// 글로벌 fetch 모킹
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// window.location 모킹
const originalLocation = window.location;

function mockResponse(status: number, body?: unknown, ok?: boolean): Response {
  return {
    ok: ok ?? (status >= 200 && status < 300),
    status,
    json: vi.fn().mockResolvedValue(body),
    headers: new Headers(),
  } as unknown as Response;
}

describe("apiFetch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // window.location을 쓰기 가능하도록 재정의
    Object.defineProperty(window, "location", {
      writable: true,
      value: { ...originalLocation, href: "" },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      writable: true,
      value: originalLocation,
    });
  });

  it("성공 응답 → { ok: true, data, status }", async () => {
    const payload = { user: "test" };
    mockFetch.mockResolvedValue(mockResponse(200, payload));

    const result = await apiFetch<{ user: string }>("/api/me");

    expect(result).toEqual({ ok: true, data: payload, status: 200 });
    expect(mockFetch).toHaveBeenCalledOnce();
  });

  it("HTTP 에러 (예: 400) → body.error를 반환", async () => {
    mockFetch.mockResolvedValue(
      mockResponse(400, { error: "INVALID_INPUT" }, false),
    );

    const result = await apiFetch("/api/test");

    expect(result).toEqual({
      ok: false,
      error: "INVALID_INPUT",
      status: 400,
    });
  });

  it("401 응답 → /login으로 리다이렉트 + UNAUTHENTICATED 반환", async () => {
    mockFetch.mockResolvedValue(mockResponse(401, {}, false));

    const result = await apiFetch("/api/me");

    expect(window.location.href).toBe("/login");
    expect(result).toEqual({
      ok: false,
      error: "UNAUTHENTICATED",
      status: 401,
    });
  });

  it("네트워크 에러 (fetch throws) → { ok: false, error, status: 0 }", async () => {
    mockFetch.mockRejectedValue(new Error("Failed to fetch"));

    const result = await apiFetch("/api/test");

    expect(result).toEqual({
      ok: false,
      error: "Failed to fetch",
      status: 0,
    });
  });

  it("skipGlobalLoading → x-no-global-loading 헤더 설정", async () => {
    mockFetch.mockResolvedValue(mockResponse(200, {}));

    await apiFetch("/api/test", { skipGlobalLoading: true });

    const calledHeaders = mockFetch.mock.calls[0][1].headers as Headers;
    expect(calledHeaders.get("x-no-global-loading")).toBe("true");
  });

  it("에러 응답 body가 JSON이 아닌 경우 → HTTP_{status} 반환", async () => {
    const badRes = {
      ok: false,
      status: 503,
      json: vi.fn().mockRejectedValue(new SyntaxError("Unexpected token")),
      headers: new Headers(),
    } as unknown as Response;
    mockFetch.mockResolvedValue(badRes);

    const result = await apiFetch("/api/test");

    expect(result).toEqual({
      ok: false,
      error: "HTTP_503",
      status: 503,
    });
  });

  it("에러 응답에 error 필드가 없으면 HTTP_{status} 폴백", async () => {
    mockFetch.mockResolvedValue(
      mockResponse(500, { message: "internal" }, false),
    );

    const result = await apiFetch("/api/test");

    expect(result).toEqual({
      ok: false,
      error: "HTTP_500",
      status: 500,
    });
  });

  it("네트워크 에러가 Error 인스턴스가 아닌 경우 → NETWORK_ERROR 반환", async () => {
    mockFetch.mockRejectedValue("random string error");

    const result = await apiFetch("/api/test");

    expect(result).toEqual({
      ok: false,
      error: "NETWORK_ERROR",
      status: 0,
    });
  });

  it("AbortError → 그대로 re-throw (호출 측에서 처리)", async () => {
    const abortError = new DOMException("The operation was aborted", "AbortError");
    mockFetch.mockRejectedValue(abortError);

    await expect(apiFetch("/api/test")).rejects.toSatisfy(
      (err: unknown) => err instanceof DOMException && err.name === "AbortError",
    );
  });
});
