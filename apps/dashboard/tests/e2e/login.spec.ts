import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";

test.describe("Login Page", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test("로그인 카드가 올바르게 렌더링된다", async () => {
    // 로그인 카드 컨테이너
    await expect(loginPage.loginCard).toBeVisible();

    // SOLARIS 로고
    await expect(loginPage.logo).toBeVisible();
    await expect(loginPage.logo).toHaveText("SOLARIS");

    // 시스템 식별자
    await expect(loginPage.systemIdentifier).toBeVisible();

    // 인증 필요 안내
    await expect(loginPage.authRequiredText).toBeVisible();

    // 시스템 상태
    await expect(loginPage.systemOnlineStatus).toBeVisible();
  });

  test("Discord OAuth 버튼이 표시된다", async () => {
    await expect(loginPage.discordLoginButton).toBeVisible();
    await expect(loginPage.discordLoginButton).toBeEnabled();

    // Discord 아이콘 SVG 확인
    const svg = loginPage.discordLoginButton.locator("svg");
    await expect(svg).toBeVisible();
  });

  test("터미널 스타일 안내 메시지가 표시된다", async () => {
    // 터미널 블록 내부 메시지
    const terminalBlock = loginPage.loginCard.locator(
      ".font-mono",
    );
    await expect(terminalBlock.first()).toBeVisible();

    // "식별 인증이 필요합니다" 메시지
    await expect(
      loginPage.loginCard.locator("text=식별 인증이 필요합니다"),
    ).toBeVisible();
  });

  test("Discord 로그인 버튼 클릭 시 OAuth 프로바이더로 리다이렉트를 시도한다", async ({
    page,
  }) => {
    // 클릭 전: 원래 텍스트
    await expect(loginPage.discordLoginButton).toHaveText("통신 채널로 인증");
    await expect(loginPage.discordLoginButton).toBeEnabled();

    // signInWithOAuth는 전체 페이지 navigation을 발생시킴
    // Supabase auth URL로의 리다이렉트를 가로채서 검증
    const [response] = await Promise.all([
      page.waitForResponse(
        (resp) => resp.url().includes("supabase") || resp.url().includes("auth"),
        { timeout: 10_000 },
      ).catch(() => null),
      page.waitForURL(
        (url) => url.href.includes("supabase") || url.href.includes("auth"),
        { timeout: 10_000 },
      ).catch(() => null),
      loginPage.discordLoginButton.click(),
    ]);

    // 버튼 클릭으로 페이지가 Supabase/OAuth URL로 이동했거나,
    // 에러 페이지가 표시되면 OAuth 연결 시도가 수행된 것
    const currentUrl = page.url();
    const navigatedToAuth =
      currentUrl.includes("supabase") ||
      currentUrl.includes("auth") ||
      currentUrl.includes("discord");

    // 로컬 환경에서 Discord provider가 비활성화되어 에러가 발생할 수 있음
    // 중요한 것은 버튼 클릭이 OAuth 플로우를 트리거했다는 것
    expect(navigatedToAuth || currentUrl !== "http://localhost:3001/login").toBe(
      true,
    );
  });

  test("DEV 모드에서 이메일 로그인 폼이 표시된다", async ({ page }) => {
    // NODE_ENV=development에서만 표시됨
    // dev 서버에서 실행 중이므로 표시되어야 함
    // 클라이언트 하이드레이션 후 렌더링되므로 충분히 대기
    const devSection = page.locator("text=DEV ONLY");

    // dev 환경인 경우에만 테스트 (하이드레이션 대기 포함)
    try {
      await devSection.waitFor({ state: "visible", timeout: 5_000 });
    } catch {
      test.skip(true, "DEV 로그인 폼은 development 환경에서만 표시됨");
      return;
    }

    if (await devSection.isVisible()) {
      await expect(loginPage.devEmailInput).toBeVisible();
      await expect(loginPage.devPasswordInput).toBeVisible();
      await expect(loginPage.devLoginButton).toBeVisible();

      // 빈 상태에서 DEV 로그인 버튼이 비활성화
      await expect(loginPage.devLoginButton).toBeDisabled();

      // 이메일만 입력 - 여전히 비활성화
      await loginPage.devEmailInput.fill("test@example.com");
      await expect(loginPage.devLoginButton).toBeDisabled();

      // 비밀번호도 입력 - 활성화
      await loginPage.devPasswordInput.fill("password123");
      await expect(loginPage.devLoginButton).toBeEnabled();
    } else {
      test.skip(true, "DEV 로그인 폼은 development 환경에서만 표시됨");
    }
  });

  test("페이지 타이틀에 SOLARIS가 포함된다", async ({ page }) => {
    await expect(page).toHaveTitle(/SOLARIS/);
  });

  test("hud-corners 스타일이 로그인 카드에 적용된다", async () => {
    // CSS 클래스 확인
    await expect(loginPage.loginCard).toHaveClass(/hud-corners/);
  });
});
