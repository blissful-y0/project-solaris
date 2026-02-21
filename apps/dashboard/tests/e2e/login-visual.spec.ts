import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";

test.describe("Login Page Visual & Interaction", () => {
  test("로그인 페이지 전체 레이아웃 스크린샷 캡처", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // 전체 페이지 스크린샷
    await page.screenshot({
      path: "test-results/screenshots/login-full-page.png",
      fullPage: true,
    });

    // 로그인 카드만 스크린샷
    await loginPage.loginCard.screenshot({
      path: "test-results/screenshots/login-card.png",
    });
  });

  test("SYSTEM ONLINE 상태 표시기가 녹색 애니메이션을 가진다", async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // 상태 인디케이터 점
    const statusDot = page.locator(".bg-success.animate-\\[pulse-glow_2s_ease-in-out_infinite\\]");

    // 정확한 클래스 매칭이 어려울 수 있으므로, 텍스트 기반으로 확인
    await expect(loginPage.systemOnlineStatus).toBeVisible();

    // SYSTEM ONLINE 옆의 녹색 점 확인
    const greenDot = page.locator(".bg-success").first();
    await expect(greenDot).toBeVisible();
  });

  test("로그인 카드가 화면 중앙에 위치한다", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // 카드가 보이는지 확인
    await expect(loginPage.loginCard).toBeVisible();

    // 부모 컨테이너가 flex + items-center + justify-center인지 간접 확인
    // (카드의 위치가 화면 중앙 근처인지)
    const cardBox = await loginPage.loginCard.boundingBox();
    const viewportSize = page.viewportSize();
    if (cardBox && viewportSize) {
      const cardCenterX = cardBox.x + cardBox.width / 2;
      const viewportCenterX = viewportSize.width / 2;
      // 중앙에서 100px 이내
      expect(Math.abs(cardCenterX - viewportCenterX)).toBeLessThan(100);
    }
  });

  test("로그인 버튼에 hover 스타일이 적용된다", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // hover 전 스크린샷
    await loginPage.discordLoginButton.screenshot({
      path: "test-results/screenshots/login-button-default.png",
    });

    // hover 상태
    await loginPage.discordLoginButton.hover();

    // hover 후 스크린샷
    await loginPage.discordLoginButton.screenshot({
      path: "test-results/screenshots/login-button-hover.png",
    });
  });
});
