import { test, expect } from "@playwright/test";

test("채팅 전송 네트워크 확인", async ({ page }) => {
  const postRequests: { url: string; status: number }[] = [];

  page.on("response", (resp) => {
    if (resp.request().method() === "POST" && resp.url().includes("/api/")) {
      postRequests.push({ url: resp.url(), status: resp.status() });
    }
  });

  await page.goto("/operation");
  await expect(page.getByText("통합 작전 목록")).toBeVisible({ timeout: 15_000 });

  await page.getByRole("button", { name: "DOWNTIME" }).click();
  const cards = page.getByRole("article");
  if (await cards.count() === 0) { test.skip(true, "downtime 작전 없음"); return; }

  await cards.first().getByRole("button", { name: "관전" }).click();
  await page.waitForURL(/\/operation\/[^/]+$/);

  const chatInput = page.locator('[data-testid="chat-input"]');
  await chatInput.waitFor({ state: "visible", timeout: 15_000 });

  // 클릭 → 포커스 → 타이핑 → Enter로 전송 (force 없이)
  await chatInput.click();
  await chatInput.type("E2E 채팅 테스트");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(2000);

  const afterValue = await chatInput.inputValue();
  console.log("전송 후 입력창 값:", JSON.stringify(afterValue));
  console.log("POST 요청:", JSON.stringify(postRequests, null, 2));

  await page.screenshot({ path: "tests/e2e/screenshots/chat-send-result.png" });
});
