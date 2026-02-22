import { render, screen, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import { describe, expect, it, vi, afterEach } from "vitest";

import CorePage from "../page";
import { DashboardSessionProvider } from "@/components/layout/DashboardSessionProvider";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/core",
}));

function makeApprovedFetch() {
  return vi.fn().mockImplementation((url: string) => {
    if (url === "/api/me") {
      return Promise.resolve({
        ok: true,
        json: async () => ({ character: { status: "approved" } }),
      });
    }
    return Promise.resolve({ ok: true, json: async () => ({}) });
  });
}

function makeUnapprovedFetch() {
  return vi.fn().mockImplementation((url: string) => {
    if (url === "/api/me") {
      return Promise.resolve({
        ok: true,
        json: async () => ({ character: { status: "pending" } }),
      });
    }
    return Promise.resolve({ ok: true, json: async () => ({}) });
  });
}

function renderWithSWR(ui: React.ReactElement) {
  return render(
    <SWRConfig
      value={{
        provider: () => new Map(),
        dedupingInterval: 0,
        errorRetryCount: 0,
      }}
    >
      {ui}
    </SWRConfig>,
  );
}

describe("CorePage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("HELIOS CORE // COMMAND CENTER 헤더를 렌더링한다", async () => {
    vi.stubGlobal("fetch", makeApprovedFetch());
    renderWithSWR(<DashboardSessionProvider><CorePage /></DashboardSessionProvider>);
    expect(await screen.findByText("HELIOS CORE // COMMAND CENTER")).toBeInTheDocument();
  });

  it("스토리 브리핑 타임라인을 렌더링한다", async () => {
    vi.stubGlobal("fetch", makeApprovedFetch());
    renderWithSWR(<DashboardSessionProvider><CorePage /></DashboardSessionProvider>);
    expect(await screen.findByText("제3구역 검문 강화 — Enforcer 긴급 배치")).toBeInTheDocument();
  });

  it("SYSTEM NOTICE 공지판을 렌더링한다", async () => {
    vi.stubGlobal("fetch", makeApprovedFetch());
    renderWithSWR(<DashboardSessionProvider><CorePage /></DashboardSessionProvider>);
    await waitFor(() => {
      expect(screen.getByText("SYSTEM NOTICE")).toBeInTheDocument();
      expect(screen.getByText("시즌 0 사전 브리핑 안내")).toBeInTheDocument();
    });
  });

  it("HELIOS SYSTEM STATUS를 렌더링한다", async () => {
    vi.stubGlobal("fetch", makeApprovedFetch());
    renderWithSWR(<DashboardSessionProvider><CorePage /></DashboardSessionProvider>);
    await waitFor(() => {
      const headers = screen.getAllByText("HELIOS SYSTEM STATUS");
      expect(headers.length).toBe(2);
      const arcLabels = screen.getAllByText("ARC-01 // 35%");
      expect(arcLabels.length).toBe(2);
    });
  });

  it("COMBAT HIGHLIGHTS를 렌더링한다", async () => {
    vi.stubGlobal("fetch", makeApprovedFetch());
    renderWithSWR(<DashboardSessionProvider><CorePage /></DashboardSessionProvider>);
    await waitFor(() => {
      expect(screen.getByText("COMBAT HIGHLIGHTS")).toBeInTheDocument();
      expect(screen.getByText("아마츠키 레이 vs 카이토 진")).toBeInTheDocument();
    });
  });

  it("도시 공명율과 활성 작전을 표시한다", async () => {
    vi.stubGlobal("fetch", makeApprovedFetch());
    renderWithSWR(<DashboardSessionProvider><CorePage /></DashboardSessionProvider>);
    await waitFor(() => {
      const resonance = screen.getAllByText("82.4%");
      expect(resonance.length).toBe(2);
      const ops = screen.getAllByText("7");
      expect(ops.length).toBe(2);
    });
  });

  it("데스크탑 3열 그리드 레이아웃을 가진다", async () => {
    vi.stubGlobal("fetch", makeApprovedFetch());
    const { container } = renderWithSWR(<DashboardSessionProvider><CorePage /></DashboardSessionProvider>);
    await waitFor(() => {
      const grid = container.querySelector(".lg\\:grid-cols-3");
      expect(grid).toBeInTheDocument();
    });
  });

  it("모바일에서 SystemStatus가 상단에 표시된다", async () => {
    vi.stubGlobal("fetch", makeApprovedFetch());
    const { container } = renderWithSWR(<DashboardSessionProvider><CorePage /></DashboardSessionProvider>);
    await waitFor(() => {
      const mobileStatus = container.querySelector("[data-testid='mobile-system-status']");
      expect(mobileStatus).toBeInTheDocument();
    });
  });

  it("미승인 상태에서 AccessDenied를 표시한다", async () => {
    vi.stubGlobal("fetch", makeUnapprovedFetch());
    renderWithSWR(<DashboardSessionProvider><CorePage /></DashboardSessionProvider>);
    await waitFor(() => {
      expect(screen.getByText(/작전 참여 자격이 필요합니다/)).toBeInTheDocument();
    });
  });
});
