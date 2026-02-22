import { test as setup, expect } from "@playwright/test";
import path from "path";

const SESSION_PATH = path.join(__dirname, ".auth/session.json");

/**
 * DEV 전용 이메일 로그인으로 인증 세션 생성.
 * NODE_ENV=development 에서만 표시되는 폼 사용.
 */
setup("DEV 이메일 로그인 세션 생성", async ({ page }) => {
  await page.goto("/login");

  // DEV 전용 이메일 로그인 폼이 보일 때까지 대기
  const emailInput = page.locator('input[type="email"]');
  await expect(emailInput).toBeVisible({ timeout: 10_000 });

  // 자격증명 입력
  await emailInput.fill("test@gmail.com");
  await page.locator('input[type="password"]').fill("1234");

  // DEV 이메일 로그인 버튼 클릭
  await page.getByRole("button", { name: /DEV 이메일 로그인/ }).click();

  // 로그인 성공 → 홈(/)으로 이동 대기
  await page.waitForURL(/^http:\/\/localhost:3001\/(?!login)/, {
    timeout: 15_000,
  });

  // 세션 저장
  await page.context().storageState({ path: SESSION_PATH });
  console.log(`세션 저장 완료: ${SESSION_PATH}`);
});
