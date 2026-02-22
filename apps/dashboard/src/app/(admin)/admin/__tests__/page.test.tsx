import { render, screen, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AdminPage from "../page";

function renderWithSWR(ui: React.ReactElement) {
  return render(
    <SWRConfig
      value={{
        provider: () => new Map(),
        dedupingInterval: 0,
        errorRetryCount: 0,
        shouldRetryOnError: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
      }}
    >
      {ui}
    </SWRConfig>,
  );
}

describe("AdminPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("통계 카드를 표시한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            characters: { pending: 3, approved: 10, rejected: 2, total: 15 },
            users: 5,
            notifications: 8,
          },
        }),
      }),
    );

    renderWithSWR(<AdminPage />);

    expect(screen.getByText("ADMIN CONSOLE")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByText("10")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
      expect(screen.getByText("15")).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();
    });
  });

  it("403이면 Access Denied를 표시한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        json: async () => ({ error: "FORBIDDEN" }),
      }),
    );

    renderWithSWR(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText("ACCESS DENIED")).toBeInTheDocument();
    });
  });
});
