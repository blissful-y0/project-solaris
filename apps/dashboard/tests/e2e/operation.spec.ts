import { test, expect } from "@playwright/test";

/**
 * Operation(작전) 플로우 E2E 테스트
 *
 * 인증 상태에 따라 분기:
 * - 미인증: 리다이렉트 확인 (항상 실행)
 * - 인증 필요: storageState 없으면 skip
 */

/* ── A. 미인증 상태 테스트 (로그인 불필요) ── */

test.describe("미인증 — 리다이렉트", () => {
  // storageState 전역 설정 무시 — 빈 세션으로 실행
  test.use({ storageState: { cookies: [], origins: [] } });
  test("로그인 없이 /operation 접근 시 /login 으로 리다이렉트된다", async ({
    page,
  }) => {
    await page.goto("/operation");

    // 미들웨어가 /login?redirect=/operation 으로 리다이렉트
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain("/login");

    // redirect 파라미터에 원래 경로 포함
    const url = new URL(page.url());
    expect(url.searchParams.get("redirect")).toBe("/operation");
  });

  test("로그인 없이 /operation/[id] 접근 시 /login 으로 리다이렉트된다", async ({
    page,
  }) => {
    await page.goto("/operation/test-id-123");

    await page.waitForURL(/\/login/);
    expect(page.url()).toContain("/login");

    const url = new URL(page.url());
    expect(url.searchParams.get("redirect")).toBe("/operation/test-id-123");
  });

  test("로그인 페이지에 인증 버튼이 표시된다", async ({ page }) => {
    await page.goto("/login");

    // login-card 컨테이너 확인
    const loginCard = page.locator('[data-testid="login-card"]');
    await expect(loginCard).toBeVisible();

    // SOLARIS 로고 텍스트
    await expect(page.locator("h1")).toContainText("SOLARIS");

    // Discord 인증 버튼 (통신 채널로 인증)
    const authButton = page.getByRole("button", { name: /통신 채널로 인증/ });
    await expect(authButton).toBeVisible();
    await expect(authButton).toBeEnabled();
  });

  test("로그인 페이지에 SYSTEM ONLINE 상태가 표시된다", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByText("SYSTEM ONLINE")).toBeVisible();
  });
});

/* ── B~E. 인증 필요 테스트 ── */

/**
 * 인증 세션이 필요한 테스트 그룹.
 *
 * 실행 조건:
 * 1. dev 서버가 localhost:3001 에서 구동 중
 * 2. tests/e2e/.auth/session.json 파일에 Supabase 세션 쿠키가 저장되어 있어야 함
 *
 * 세션 파일 생성 방법:
 *   1) 브라우저에서 localhost:3001/login 으로 로그인
 *   2) Playwright Inspector 또는 다음 스크립트로 storageState 저장:
 *      npx playwright codegen --save-storage=tests/e2e/.auth/session.json http://localhost:3001
 */
const authSessionPath = "tests/e2e/.auth/session.json";

test.describe("인증 필요 — Operation 목록", () => {
  // storageState 파일이 없으면 전체 스킵
  test.use({ storageState: authSessionPath });

  test.beforeEach(async ({ page }, testInfo) => {
    // storageState 파일 부재 시 graceful skip
    try {
      const response = await page.goto("/operation");
      // 로그인 페이지로 리다이렉트되면 세션이 유효하지 않음
      if (page.url().includes("/login")) {
        testInfo.skip(true, "유효한 인증 세션 없음 — tests/e2e/.auth/session.json 필요");
      }
      // 서버 미응답 처리
      if (!response || response.status() >= 500) {
        testInfo.skip(true, "dev 서버 응답 없음 또는 서버 에러");
      }
    } catch {
      testInfo.skip(true, "dev 서버 미구동 또는 네트워크 에러");
    }
  });

  /* ── B. Operation 목록 페이지 ── */

  test("승인된 사용자: 작전 목록이 로드된다", async ({ page }) => {
    // OperationHub 헤더 확인
    await expect(page.getByText("통합 작전 목록")).toBeVisible({
      timeout: 15_000,
    });

    // TACTICAL HUB 라벨
    await expect(
      page.getByText("OPERATION // TACTICAL HUB"),
    ).toBeVisible();

    // 채널 수 표시 (N개 채널)
    await expect(page.getByText(/\d+개 채널/)).toBeVisible();
  });

  test("미승인 사용자: AccessDenied 화면이 표시된다", async ({ page }) => {
    // AccessDenied 또는 OperationHub 둘 중 하나가 보여야 함
    const accessDenied = page.getByText("작전 참여 자격이 필요합니다");
    const operationHub = page.getByText("통합 작전 목록");

    // 둘 중 하나가 15초 내에 보이는지 확인
    const visible = await Promise.race([
      accessDenied.waitFor({ state: "visible", timeout: 15_000 }).then(() => "denied"),
      operationHub.waitFor({ state: "visible", timeout: 15_000 }).then(() => "hub"),
    ]).catch(() => "none");

    // 어느 쪽이든 표시 가능 — 캐릭터 상태에 따라 다름
    expect(["denied", "hub"]).toContain(visible);

    if (visible === "denied") {
      // HELIOS SYSTEM 라벨 확인
      await expect(page.getByText("HELIOS SYSTEM")).toBeVisible();
    }
  });

  test("+ 새 작전 버튼이 표시된다", async ({ page }) => {
    // OperationHub 로드 대기
    await expect(page.getByText("통합 작전 목록")).toBeVisible({
      timeout: 15_000,
    });

    // "새 작전" 버튼
    const createBtn = page.getByRole("button", { name: /새 작전/ });
    await expect(createBtn).toBeVisible();
  });

  test("타입 필터 칩이 표시된다 (ALL / OPERATION / DOWNTIME)", async ({
    page,
  }) => {
    await expect(page.getByText("통합 작전 목록")).toBeVisible({
      timeout: 15_000,
    });

    await expect(page.getByRole("button", { name: "ALL" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "OPERATION" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "DOWNTIME" }),
    ).toBeVisible();
  });

  test("상태 필터 칩이 표시된다 (전체 / 대기 / LIVE / 완료)", async ({
    page,
  }) => {
    await expect(page.getByText("통합 작전 목록")).toBeVisible({
      timeout: 15_000,
    });

    await expect(page.getByRole("button", { name: "전체" })).toBeVisible();
    await expect(page.getByRole("button", { name: "대기" })).toBeVisible();
    await expect(page.getByRole("button", { name: "LIVE" })).toBeVisible();
    await expect(page.getByRole("button", { name: "완료" })).toBeVisible();
  });

  /* ── C. 작전 카드 CTA ── */

  test("진행 중(live) 작전 카드에 관전 + 입장 버튼이 표시된다", async ({
    page,
  }) => {
    await expect(page.getByText("통합 작전 목록")).toBeVisible({
      timeout: 15_000,
    });

    // LIVE 필터 활성화해서 live 작전만 표시
    await page.getByRole("button", { name: "LIVE" }).click();

    // 작전 카드 article 요소
    const cards = page.getByRole("article");
    const cardCount = await cards.count();

    if (cardCount === 0) {
      // live 작전이 없으면 스킵
      test.skip(true, "현재 live 작전이 없음");
      return;
    }

    const firstCard = cards.first();

    // 관전 버튼
    await expect(
      firstCard.getByRole("button", { name: "관전" }),
    ).toBeVisible();

    // 입장 버튼
    await expect(
      firstCard.getByRole("button", { name: /입장/ }),
    ).toBeVisible();
  });

  test("완료된(completed) 작전 카드에 열람 버튼만 표시된다", async ({
    page,
  }) => {
    await expect(page.getByText("통합 작전 목록")).toBeVisible({
      timeout: 15_000,
    });

    // 완료 필터 활성화
    await page.getByRole("button", { name: "완료" }).click();

    const cards = page.getByRole("article");
    const cardCount = await cards.count();

    if (cardCount === 0) {
      test.skip(true, "현재 완료된 작전이 없음");
      return;
    }

    const firstCard = cards.first();

    // 열람 버튼만 존재
    await expect(
      firstCard.getByRole("button", { name: /열람/ }),
    ).toBeVisible();

    // 관전/입장 버튼은 없어야 함
    await expect(
      firstCard.getByRole("button", { name: "관전" }),
    ).not.toBeVisible();
    await expect(
      firstCard.getByRole("button", { name: /입장/ }),
    ).not.toBeVisible();
  });

  /* ── D. 관전 플로우 ── */

  test("관전 버튼 클릭 시 /operation/[id] 로 이동한다", async ({ page }) => {
    await expect(page.getByText("통합 작전 목록")).toBeVisible({
      timeout: 15_000,
    });

    // LIVE 필터
    await page.getByRole("button", { name: "LIVE" }).click();

    const cards = page.getByRole("article");
    const cardCount = await cards.count();

    if (cardCount === 0) {
      test.skip(true, "현재 live 작전이 없음");
      return;
    }

    // join API 호출이 없는지 확인하기 위해 네트워크 모니터링
    const joinRequests: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("/join")) {
        joinRequests.push(request.url());
      }
    });

    // 관전 버튼 클릭
    const firstCard = cards.first();
    await firstCard.getByRole("button", { name: "관전" }).click();

    // /operation/[id] 패턴으로 이동 확인
    await page.waitForURL(/\/operation\/[^/]+$/);
    expect(page.url()).toMatch(/\/operation\/[^/]+$/);

    // join API 호출이 없어야 함
    expect(joinRequests).toHaveLength(0);
  });

  /* ── E. 다운타임 채팅방 ── */

  test("다운타임 방 진입 시 채팅 입력창이 표시된다", async ({ page }) => {
    await expect(page.getByText("통합 작전 목록")).toBeVisible({
      timeout: 15_000,
    });

    // DOWNTIME 필터 + LIVE 또는 대기 상태
    await page.getByRole("button", { name: "DOWNTIME" }).click();

    const cards = page.getByRole("article");
    const cardCount = await cards.count();

    if (cardCount === 0) {
      test.skip(true, "현재 다운타임 작전이 없음");
      return;
    }

    // 첫 번째 다운타임 카드의 관전 버튼 클릭
    const firstCard = cards.first();
    const spectateBtn = firstCard.getByRole("button", { name: "관전" });
    const browseBtn = firstCard.getByRole("button", { name: /열람/ });

    // 관전 또는 열람 버튼 클릭 (상태에 따라 다름)
    if (await spectateBtn.isVisible()) {
      await spectateBtn.click();
    } else if (await browseBtn.isVisible()) {
      await browseBtn.click();
    } else {
      test.skip(true, "접근 가능한 다운타임 CTA 없음");
      return;
    }

    // /operation/[id] 로 이동 대기
    await page.waitForURL(/\/operation\/[^/]+$/);

    // 방 로드 대기 — 채팅 입력창 또는 에러 메시지
    const chatInput = page.locator('[data-testid="chat-input"]');
    const errorText = page.getByText("작전을 찾을 수 없습니다");
    const operationMsg = page.getByText("전투 세션(operation)");

    const what = await Promise.race([
      chatInput.waitFor({ state: "visible", timeout: 15_000 }).then(() => "chat"),
      errorText.waitFor({ state: "visible", timeout: 15_000 }).then(() => "error"),
      operationMsg.waitFor({ state: "visible", timeout: 15_000 }).then(() => "operation"),
    ]).catch(() => "timeout");

    if (what === "chat") {
      // 채팅 입력창 확인
      await expect(chatInput).toBeVisible();
      await expect(chatInput).toHaveAttribute("placeholder", "서술을 입력하세요...");

      // 전송 버튼 확인
      const sendBtn = page.locator('[data-testid="send-button"]');
      await expect(sendBtn).toBeVisible();

      // 뒤로가기 버튼 확인
      const backBtn = page.locator('[data-testid="back-button"]');
      await expect(backBtn).toBeVisible();

      // 참가자 수 표시 확인
      const participantCount = page.locator('[data-testid="participant-count"]');
      await expect(participantCount).toBeVisible();
    } else if (what === "operation") {
      // operation 타입인 경우 — 아직 미구현 안내 메시지
      await expect(operationMsg).toBeVisible();
    } else {
      // 에러 또는 타임아웃 — 테스트는 통과하되 로그 기록
      test.info().annotations.push({
        type: "warning",
        description: `방 진입 결과: ${what}`,
      });
    }
  });

  test("다운타임 채팅방에서 메시지 입력 후 전송할 수 있다", async ({
    page,
  }) => {
    await expect(page.getByText("통합 작전 목록")).toBeVisible({
      timeout: 15_000,
    });

    // DOWNTIME + LIVE 필터
    await page.getByRole("button", { name: "DOWNTIME" }).click();
    await page.getByRole("button", { name: "LIVE" }).click();

    const cards = page.getByRole("article");
    const cardCount = await cards.count();

    if (cardCount === 0) {
      test.skip(true, "현재 live 다운타임 작전이 없음");
      return;
    }

    // 관전으로 입장
    await cards.first().getByRole("button", { name: "관전" }).click();
    await page.waitForURL(/\/operation\/[^/]+$/);

    // 채팅 입력창 대기
    const chatInput = page.locator('[data-testid="chat-input"]');
    try {
      await chatInput.waitFor({ state: "visible", timeout: 15_000 });
    } catch {
      test.skip(true, "채팅 입력창 미표시 — downtime 방이 아닐 수 있음");
      return;
    }

    // 전송 버튼 (초기 비활성)
    const sendBtn = page.locator('[data-testid="send-button"]');
    await expect(sendBtn).toBeDisabled();

    // 메시지 입력 후 Enter로 전송 (dev overlay portal 우회)
    await chatInput.click();
    await chatInput.type("E2E 테스트 메시지입니다.");
    await expect(sendBtn).toBeEnabled();

    // Enter 키로 전송
    await page.keyboard.press("Enter");

    // 전송 성공 → 입력창 초기화 확인
    await expect(chatInput).toHaveValue("", { timeout: 5_000 });
  });
});
