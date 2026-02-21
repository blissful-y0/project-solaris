import type { Locator, Page } from "@playwright/test";

/**
 * LoginPage POM
 * - /login 경로의 Discord OAuth 로그인 화면
 * - data-testid="login-card" 컨테이너
 */
export class LoginPage {
  readonly page: Page;

  /** 로그인 카드 컨테이너 */
  readonly loginCard: Locator;

  /** SOLARIS 로고 텍스트 */
  readonly logo: Locator;

  /** "SOLARIS NETWORK" 시스템 식별자 */
  readonly systemIdentifier: Locator;

  /** "OPERATOR AUTHENTICATION REQUIRED" 부제 */
  readonly authRequiredText: Locator;

  /** 터미널 스타일 안내 메시지 블록 */
  readonly terminalMessage: Locator;

  /** Discord OAuth 로그인 버튼 ("통신 채널로 인증") */
  readonly discordLoginButton: Locator;

  /** SYSTEM ONLINE 상태 표시 */
  readonly systemOnlineStatus: Locator;

  /** 에러 메시지 (동적 표시) */
  readonly errorMessage: Locator;

  /** DEV 전용 이메일 입력 */
  readonly devEmailInput: Locator;

  /** DEV 전용 비밀번호 입력 */
  readonly devPasswordInput: Locator;

  /** DEV 전용 로그인 버튼 */
  readonly devLoginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.loginCard = page.locator('[data-testid="login-card"]');
    this.logo = page.locator("h1", { hasText: "SOLARIS" });
    this.systemIdentifier = page.locator("text=SOLARIS NETWORK");
    this.authRequiredText = page.locator(
      "text=OPERATOR AUTHENTICATION REQUIRED",
    );
    this.terminalMessage = this.loginCard.locator(".font-mono").first();
    this.discordLoginButton = page.locator("button", {
      hasText: "통신 채널로 인증",
    });
    this.systemOnlineStatus = page.locator("text=SYSTEM ONLINE");
    this.errorMessage = this.loginCard.locator(".text-accent");
    this.devEmailInput = page.locator('input[type="email"]');
    this.devPasswordInput = page.locator('input[type="password"]');
    this.devLoginButton = page.locator("button", {
      hasText: "DEV 이메일 로그인",
    });
  }

  async goto() {
    await this.page.goto("/login");
    await this.loginCard.waitFor({ state: "visible" });
  }
}
