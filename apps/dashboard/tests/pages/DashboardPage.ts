import type { Locator, Page } from "@playwright/test";

/**
 * DashboardPage POM
 * - 인증 후 공통 레이아웃 (TopBar + MobileTabBar + SolarisTicker)
 * - 네비게이션 탭: Home, Helios Core, Operation, Registry, Lore
 */
export class DashboardPage {
  readonly page: Page;

  /** TopBar 헤더 */
  readonly topBar: Locator;

  /** TopBar 내 SOLARIS 로고 */
  readonly topBarLogo: Locator;

  /** 데스크탑 네비게이션 (md 이상) */
  readonly desktopNav: Locator;

  /** 모바일 탭바 (md 미만) */
  readonly mobileTabBar: Locator;

  /** SolarisTicker */
  readonly ticker: Locator;

  /** 알림 벨 버튼 */
  readonly notificationBell: Locator;

  /** 마이페이지 링크 (UserCircle) */
  readonly myPageLink: Locator;

  /** 알림 배지 (카운트가 있을 때만 표시) */
  readonly notificationBadge: Locator;

  constructor(page: Page) {
    this.page = page;
    this.topBar = page.locator("header").first();
    this.topBarLogo = this.topBar.locator("text=SOLARIS");
    this.desktopNav = this.topBar.locator("nav");
    this.mobileTabBar = page
      .locator("nav")
      .filter({ has: page.locator("a[href='/']") })
      .last();
    this.ticker = page.locator('[data-testid="solaris-ticker"]');
    this.notificationBell = page.locator('button[aria-label="알림"]');
    this.myPageLink = page.locator('a[aria-label="마이페이지"]');
    this.notificationBadge = page.locator(
      '[data-testid="notification-badge"]',
    );
  }

  /** 데스크탑 네비게이션 탭 링크 가져오기 */
  getDesktopNavLink(label: string): Locator {
    return this.desktopNav.locator("a", { hasText: label });
  }

  /** 데스크탑 네비게이션에서 잠금 상태인 항목 가져오기 */
  getLockedNavItem(href: string): Locator {
    return this.topBar.locator(`[data-testid="lock-icon-${href}"]`);
  }

  /** 모바일 탭바 링크 가져오기 */
  getMobileTabLink(label: string): Locator {
    return this.mobileTabBar.locator("a", { hasText: label });
  }

  /** 모바일 탭바에서 잠금 아이콘 확인 */
  getMobileLockedIcon(href: string): Locator {
    return this.page.locator(`[data-testid="lock-icon-${href}"]`);
  }
}
