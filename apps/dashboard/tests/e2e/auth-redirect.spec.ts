import { test, expect } from "@playwright/test";

test.describe("Authentication Redirects", () => {
  test("비인증 사용자가 홈(/)에 접근하면 /login으로 리다이렉트된다", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForURL("**/login**");
    expect(page.url()).toContain("/login");
  });

  test("비인증 사용자가 /operation에 접근하면 /login으로 리다이렉트된다", async ({
    page,
  }) => {
    await page.goto("/operation");
    await page.waitForURL("**/login**");
    expect(page.url()).toContain("/login");
    // redirect 파라미터에 원래 경로가 포함되어야 함
    expect(page.url()).toContain("redirect=%2Foperation");
  });

  test("비인증 사용자가 /registry에 접근하면 /login으로 리다이렉트된다", async ({
    page,
  }) => {
    await page.goto("/registry");
    await page.waitForURL("**/login**");
    expect(page.url()).toContain("/login");
    expect(page.url()).toContain("redirect=%2Fregistry");
  });

  test("비인증 사용자가 /core에 접근하면 /login으로 리다이렉트된다", async ({
    page,
  }) => {
    await page.goto("/core");
    await page.waitForURL("**/login**");
    expect(page.url()).toContain("/login");
    expect(page.url()).toContain("redirect=%2Fcore");
  });

  test("비인증 사용자가 /lore에 접근하면 /login으로 리다이렉트된다", async ({
    page,
  }) => {
    await page.goto("/lore");
    await page.waitForURL("**/login**");
    expect(page.url()).toContain("/login");
    expect(page.url()).toContain("redirect=%2Flore");
  });

  test("비인증 사용자가 /my에 접근하면 /login으로 리다이렉트된다", async ({
    page,
  }) => {
    await page.goto("/my");
    await page.waitForURL("**/login**");
    expect(page.url()).toContain("/login");
    expect(page.url()).toContain("redirect=%2Fmy");
  });

  test("비인증 API 요청은 401 JSON을 반환한다", async ({ request }) => {
    const response = await request.get("/api/me");
    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body).toHaveProperty("error", "UNAUTHENTICATED");
  });

  test("비인증 /api/characters 요청은 401을 반환한다", async ({
    request,
  }) => {
    const response = await request.get("/api/characters");
    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body).toHaveProperty("error", "UNAUTHENTICATED");
  });

  test("/login 페이지는 공개 접근 가능하다 (리다이렉트 없음)", async ({
    page,
  }) => {
    await page.goto("/login");
    // /login에 머무르고 다른 곳으로 리다이렉트되지 않아야 함
    await expect(page).toHaveURL(/\/login/);
    // 로그인 카드가 렌더링됨
    await expect(page.locator('[data-testid="login-card"]')).toBeVisible();
  });
});
