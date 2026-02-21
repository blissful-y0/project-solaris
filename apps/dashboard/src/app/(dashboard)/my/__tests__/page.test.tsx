import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import MyPage from "../page";

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

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("MyPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders MY PAGE and logout button", async () => {
    render(<MyPage />);
    expect(screen.getByText("MY PAGE")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /로그아웃/i })).toBeInTheDocument();
    await screen.findByText("테스트 유저");
  });

  it("logs out and redirects to /login", async () => {
    render(<MyPage />);
    fireEvent.click(screen.getByRole("button", { name: /로그아웃/i }));

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });
});
