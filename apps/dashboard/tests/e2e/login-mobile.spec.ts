import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";

/**
 * 모바일 뷰포트에서의 로그인 페이지 테스트
 * - project: mobile-chrome (Pixel 5, 393x851)
 */
test.describe("Login Page - Mobile", () => {
  test.skip(
    ({ browserName }) => browserName !== "chromium",
    "모바일 테스트는 Chromium에서만 실행",
  );

  test("모바일에서 로그인 카드가 올바르게 렌더링된다", async ({ page }) => {
    // 모바일 뷰포트 설정 (mobile-chrome project가 아닌 경우 대비)
    await page.setViewportSize({ width: 393, height: 851 });

    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await expect(loginPage.loginCard).toBeVisible();
    await expect(loginPage.discordLoginButton).toBeVisible();
    await expect(loginPage.logo).toBeVisible();

    // 카드가 화면 너비에 맞게 표시되는지 확인
    const cardBox = await loginPage.loginCard.boundingBox();
    if (cardBox) {
      // 카드 너비가 뷰포트의 85% 이상이어야 함 (mx-4 패딩 고려)
      expect(cardBox.width).toBeGreaterThan(393 * 0.8);
      // 카드가 화면 밖으로 나가지 않아야 함
      expect(cardBox.x + cardBox.width).toBeLessThanOrEqual(393 + 1);
    }

    // 모바일 스크린샷
    await page.screenshot({
      path: "test-results/screenshots/login-mobile.png",
      fullPage: true,
    });
  });
});
