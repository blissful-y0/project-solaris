import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

global.fetch = vi.fn();

describe("AdminLorePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("로딩 중 텍스트를 표시한다", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    });

    const { default: AdminLorePage } = await import("../page");
    render(<AdminLorePage />);
    expect(screen.getByText(/불러오는 중/i)).toBeTruthy();
  });

  it("문서 목록을 렌더링한다", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [
          { id: "1", title: "세계 개요", slug: "world-overview", clearance_level: 1, order_index: 0 },
        ],
      }),
    });

    const { default: AdminLorePage } = await import("../page");
    render(<AdminLorePage />);

    await waitFor(() => {
      expect(screen.getByText("세계 개요")).toBeTruthy();
    });
  });

  it("[새 문서] 버튼이 있다", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    });

    const { default: AdminLorePage } = await import("../page");
    render(<AdminLorePage />);

    await waitFor(() => {
      expect(screen.getByText("새 문서")).toBeTruthy();
    });
  });
});
