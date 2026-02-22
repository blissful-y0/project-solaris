import { describe, expect, it } from "vitest";
import { apiError, API_ERRORS } from "../errors";

describe("apiError", () => {
  it("올바른 status와 error code를 반환한다", async () => {
    const res = apiError("UNAUTHENTICATED");
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: "UNAUTHENTICATED" });
  });

  it("message를 포함할 수 있다", async () => {
    const res = apiError("BAD_REQUEST", "ID 형식이 올바르지 않습니다");
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({ error: "BAD_REQUEST", message: "ID 형식이 올바르지 않습니다" });
  });

  it("모든 에러 코드가 정의되어 있다", () => {
    expect(API_ERRORS.UNAUTHENTICATED.status).toBe(401);
    expect(API_ERRORS.FORBIDDEN.status).toBe(403);
    expect(API_ERRORS.NOT_FOUND.status).toBe(404);
    expect(API_ERRORS.BAD_REQUEST.status).toBe(400);
    expect(API_ERRORS.INVALID_ID.status).toBe(400);
    expect(API_ERRORS.INTERNAL.status).toBe(500);
  });
});
