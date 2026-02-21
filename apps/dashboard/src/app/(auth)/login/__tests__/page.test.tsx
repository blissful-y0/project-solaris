import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/login",
}));

// Supabase 클라이언트 모킹
const mockSignInWithOAuth = vi.fn().mockResolvedValue({ error: null });

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signInWithOAuth: mockSignInWithOAuth,
    },
  }),
}));

import LoginPage from "../page";

describe("LoginPage", () => {
  beforeEach(() => {
    mockSignInWithOAuth.mockReset();
    mockSignInWithOAuth.mockResolvedValue({ error: null });
  });

  it("redirect 쿼리가 있으면 callback next에 포함한다", async () => {
    window.history.pushState({}, "", "/login?redirect=%2Fbattle%3Ftab%3Dlive");

    const user = userEvent.setup();
    render(<LoginPage />);

    await user.click(screen.getByRole("button", { name: /통신 채널로 인증/i }));

    const oauthCall = mockSignInWithOAuth.mock.calls.at(-1)?.[0];
    expect(oauthCall.options.redirectTo).toContain("/api/auth/callback");
    expect(oauthCall.options.redirectTo).toContain("next=%2Fbattle%3Ftab%3Dlive");
  });

  it("외부 URL redirect는 next 파라미터로 전달하지 않는다", async () => {
    window.history.pushState({}, "", "/login?redirect=https://evil.example");

    const user = userEvent.setup();
    render(<LoginPage />);

    await user.click(screen.getByRole("button", { name: /통신 채널로 인증/i }));

    const oauthCall = mockSignInWithOAuth.mock.calls.at(-1)?.[0];
    expect(oauthCall.options.redirectTo).toContain("/api/auth/callback");
    expect(oauthCall.options.redirectTo).not.toContain("next=");
  });

  it("SOLARIS 타이틀을 렌더링한다", () => {
    window.history.pushState({}, "", "/login");
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

  it("OAuth 응답에 에러가 있으면 실패 메시지를 표시한다", async () => {
    mockSignInWithOAuth.mockResolvedValueOnce({
      error: { message: "oauth failed" },
    });

    const user = userEvent.setup();
    render(<LoginPage />);

    await user.click(screen.getByRole("button", { name: /통신 채널로 인증/i }));

    expect(screen.getByText("인증 요청에 실패했습니다")).toBeInTheDocument();
  });

  it("OAuth 호출 중 예외가 나면 네트워크 오류 메시지를 표시한다", async () => {
    mockSignInWithOAuth.mockRejectedValueOnce(new Error("network"));

    const user = userEvent.setup();
    render(<LoginPage />);

    await user.click(screen.getByRole("button", { name: /통신 채널로 인증/i }));

    expect(screen.getByText("네트워크 오류가 발생했습니다")).toBeInTheDocument();
  });

  it("OAuth 요청 중에는 로딩 문구를 표시한다", async () => {
    let resolveAuth!: (value: { error: null }) => void;
    const pending = new Promise<{ error: null }>((resolve) => {
      resolveAuth = resolve;
    });
    mockSignInWithOAuth.mockReturnValueOnce(pending);

    const user = userEvent.setup();
    render(<LoginPage />);

    await user.click(screen.getByRole("button", { name: /통신 채널로 인증/i }));

    expect(screen.getByText("인증 채널 연결 중...")).toBeInTheDocument();

    await act(async () => {
      resolveAuth({ error: null });
    });

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /통신 채널로 인증/i }),
      ).toBeInTheDocument();
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
