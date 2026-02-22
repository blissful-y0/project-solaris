import { render, screen, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import { describe, it, expect, vi, beforeEach } from "vitest";

global.fetch = vi.fn();

vi.mock("@uiw/react-md-editor", () => ({
  default: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <textarea
      data-testid="md-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

vi.mock("next/dynamic", () => ({
  default: (importFn: () => Promise<{ default: unknown }>) => {
    let Component: React.ComponentType<unknown> | null = null;
    importFn().then((mod) => {
      Component = mod.default as React.ComponentType<unknown>;
    });
    const DynamicWrapper = (props: unknown) => {
      if (!Component) return null;
      return <Component {...(props as object)} />;
    };
    DynamicWrapper.displayName = "DynamicWrapper";
    return DynamicWrapper;
  },
}));

describe("AdminLorePage", () => {
  const renderWithSWR = (ui: React.ReactElement) => render(
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("로딩 중 텍스트를 표시한다", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    });

    const { default: AdminLorePage } = await import("../page");
    renderWithSWR(<AdminLorePage />);
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
    renderWithSWR(<AdminLorePage />);

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
    renderWithSWR(<AdminLorePage />);

    await waitFor(() => {
      expect(screen.getByText("새 문서")).toBeTruthy();
    });
  });

  it("API 오류 시 에러 메시지를 표시한다", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      json: async () => ({ error: "FORBIDDEN" }),
    });

    const { default: AdminLorePage } = await import("../page");
    renderWithSWR(<AdminLorePage />);

    await waitFor(() => {
      expect(screen.getByText(/불러오지 못했습니다/i)).toBeTruthy();
    });
  });
});
