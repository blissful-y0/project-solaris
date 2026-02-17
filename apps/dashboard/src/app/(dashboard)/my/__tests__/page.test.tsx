import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import MyPage from "../page";

/* Supabase 클라이언트 모킹 */
const mockSignOut = vi.fn().mockResolvedValue({ error: null });
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signOut: mockSignOut,
    },
  }),
}));

/* next/navigation 모킹 */
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("MyPage (마이페이지)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders MY PAGE HUD label", () => {
    render(<MyPage />);
    expect(screen.getByText("MY PAGE")).toBeInTheDocument();
  });

  it("renders logout button", () => {
    render(<MyPage />);
    expect(screen.getByRole("button", { name: /로그아웃/i })).toBeInTheDocument();
  });

  it("calls signOut and redirects to /login on logout click", async () => {
    render(<MyPage />);
    const logoutButton = screen.getByRole("button", { name: /로그아웃/i });

    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("has main heading", () => {
    render(<MyPage />);
    expect(screen.getByRole("heading")).toBeInTheDocument();
  });
});
