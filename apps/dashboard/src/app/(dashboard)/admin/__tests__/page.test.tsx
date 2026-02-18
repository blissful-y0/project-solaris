import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AdminPage from "../page";

describe("AdminPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("큐 요약을 표시한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: [
            { id: "char_1", faction: "bureau", leader_application: true },
            { id: "char_2", faction: "static", leader_application: false },
          ],
        }),
      }),
    );

    render(<AdminPage />);

    expect(screen.getByText("ADMIN CONSOLE")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("대기 신청")).toBeInTheDocument();
      expect(screen.getByText("리더 신청")).toBeInTheDocument();
      expect(screen.getByText("Bureau 대기")).toBeInTheDocument();
      expect(screen.getByText("Static 대기")).toBeInTheDocument();
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

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText("ACCESS DENIED")).toBeInTheDocument();
    });
  });
});
