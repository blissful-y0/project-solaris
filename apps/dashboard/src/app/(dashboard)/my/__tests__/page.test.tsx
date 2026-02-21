import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import MyPage from "../page";

const mockSignOut = vi.fn().mockResolvedValue({ error: null });
const mockUseDashboardSession = vi.fn().mockReturnValue({
  me: {
    user: {
      id: "user-1",
      email: "test@example.com",
      displayName: "테스트 유저",
    },
    character: null,
  },
  loading: false,
  error: null,
  refetch: vi.fn(),
});

vi.mock("@/components/layout", async () => {
  const actual = await vi.importActual<typeof import("@/components/layout")>("@/components/layout");
  return {
    ...actual,
    useDashboardSession: () => mockUseDashboardSession(),
  };
});

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signOut: mockSignOut,
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

  it("renders MY PAGE and logout button", () => {
    render(<MyPage />);
    expect(screen.getByText("MY PAGE")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /로그아웃/i })).toBeInTheDocument();
    expect(screen.getByText("테스트 유저")).toBeInTheDocument();
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
