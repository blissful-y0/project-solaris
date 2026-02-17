import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

// Supabase 클라이언트 모킹
const mockSignInWithOAuth = vi.fn().mockResolvedValue({ error: null });
const mockSearchParamGet = vi.fn(() => null);

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: mockSearchParamGet,
  }),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signInWithOAuth: mockSignInWithOAuth,
    },
  }),
}));

import LoginPage from "../page";

describe("LoginPage", () => {
  it("redirect 쿼리가 있으면 callback next에 포함한다", async () => {
    mockSearchParamGet.mockImplementation((key: string) =>
      key === "redirect" ? "/battle?tab=live" : null,
    );

    const user = userEvent.setup();
    render(<LoginPage />);

    await user.click(screen.getByRole("button", { name: /통신 채널로 인증/i }));

    const oauthCall = mockSignInWithOAuth.mock.calls.at(-1)?.[0];
    expect(oauthCall.options.redirectTo).toContain("/api/auth/callback");
    expect(oauthCall.options.redirectTo).toContain("next=%2Fbattle%3Ftab%3Dlive");
  });

  it("외부 URL redirect는 next 파라미터로 전달하지 않는다", async () => {
    mockSearchParamGet.mockImplementation((key: string) =>
      key === "redirect" ? "https://evil.example" : null,
    );

    const user = userEvent.setup();
    render(<LoginPage />);

    await user.click(screen.getByRole("button", { name: /통신 채널로 인증/i }));

    const oauthCall = mockSignInWithOAuth.mock.calls.at(-1)?.[0];
    expect(oauthCall.options.redirectTo).toContain("/api/auth/callback");
    expect(oauthCall.options.redirectTo).not.toContain("next=");
  });

  it("SOLARIS 타이틀을 렌더링한다", () => {
    mockSearchParamGet.mockImplementation(() => null);
    render(<LoginPage />);
    expect(screen.getByText("SOLARIS")).toBeInTheDocument();
  });

  it("SOLARIS NETWORK 식별자를 표시한다", () => {
    render(<LoginPage />);
    expect(screen.getByText("SOLARIS NETWORK")).toBeInTheDocument();
  });

  it("인증 요구 서브텍스트를 표시한다", () => {
    render(<LoginPage />);
    expect(
      screen.getByText("OPERATOR AUTHENTICATION REQUIRED"),
    ).toBeInTheDocument();
  });

  it("터미널 스타일 안내 메시지를 표시한다", () => {
    render(<LoginPage />);
    expect(screen.getByText(/식별 인증이 필요합니다/)).toBeInTheDocument();
  });

  it("인증 버튼을 렌더링한다", () => {
    render(<LoginPage />);
    expect(
      screen.getByRole("button", { name: /통신 채널로 인증/i }),
    ).toBeInTheDocument();
  });

  it("인증 버튼 클릭 시 Discord OAuth를 호출한다", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.click(
      screen.getByRole("button", { name: /통신 채널로 인증/i }),
    );

    expect(mockSignInWithOAuth).toHaveBeenCalledWith({
      provider: "discord",
      options: {
        redirectTo: expect.stringContaining("/api/auth/callback"),
      },
    });
  });

  it("시스템 온라인 상태를 표시한다", () => {
    render(<LoginPage />);
    expect(screen.getByText("SYSTEM ONLINE")).toBeInTheDocument();
  });

  it("카드에 HUD 코너 스타일이 적용되어 있다", () => {
    render(<LoginPage />);
    const card = screen.getByTestId("login-card");
    expect(card.className).toMatch(/hud-corners/);
  });
});
