import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import MyPage from "../page";

/* Supabase 클라이언트 모킹 */
const mockSignOut = vi.fn().mockResolvedValue({ error: null });
const mockGetUser = vi.fn().mockResolvedValue({
  data: {
    user: {
      email: "test@example.com",
      user_metadata: { full_name: "테스트 유저" },
    },
  },
});

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signOut: mockSignOut,
      getUser: mockGetUser,
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
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("renders profile section", () => {
    render(<MyPage />);
    expect(screen.getByText("OPERATOR PROFILE")).toBeInTheDocument();
  });

  it("renders session control section", () => {
    render(<MyPage />);
    expect(screen.getByText("SESSION CONTROL")).toBeInTheDocument();
  });
});
