import { test, expect } from "@playwright/test";

/**
 * 비인증 상태에서의 API 엔드포인트 보안 테스트
 * - 모든 보호된 API가 401을 반환하는지 확인
 * - 에러 응답 형식이 일관되는지 확인
 */
test.describe("API Security - Unauthenticated Access", () => {
  const protectedEndpoints = [
    "/api/me",
    "/api/characters",
    "/api/operations",
    "/api/notifications",
  ];

  for (const endpoint of protectedEndpoints) {
    test(`${endpoint} 은 401 UNAUTHENTICATED를 반환한다`, async ({
      request,
    }) => {
      const response = await request.get(endpoint);
      expect(response.status()).toBe(401);

      const body = await response.json();
      expect(body).toHaveProperty("error", "UNAUTHENTICATED");
    });
  }

  test("/api/auth/callback 은 공개 접근 가능하다", async ({ request }) => {
    // OAuth 콜백은 공개지만 code 파라미터 없이는 에러
    const response = await request.get("/api/auth/callback");
    // 리다이렉트 또는 에러 응답 (401이 아닌 것)
    expect(response.status()).not.toBe(401);
  });
});
