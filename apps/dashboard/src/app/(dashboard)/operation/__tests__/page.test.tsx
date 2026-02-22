import { StrictMode } from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, afterEach } from "vitest";
import { SWRConfig } from "swr";

import OperationPage from "../page";
import { DashboardSessionProvider } from "@/components/layout/DashboardSessionProvider";

const ME_USER = { id: "u-1", email: null, displayName: "test", discordUsername: null, isAdmin: false };

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const MOCK_OPERATIONS = [
  {
    id: "dt-1",
    title: "다운타임 A",
    type: "downtime",
    status: "live",
    summary: "요약 A",
    isMainStory: false,
    maxParticipants: 12,
    createdAt: "2026-02-20T00:00:00.000Z",
    teamA: [],
    teamB: [],
    host: { id: "ch-1", name: "새도 번" },
  },
  {
    id: "op-1",
    title: "작전 B",
    type: "operation",
    status: "waiting",
    summary: "요약 B",
    isMainStory: false,
    maxParticipants: 4,
    createdAt: "2026-02-20T00:00:00.000Z",
    teamA: [{ id: "ch-1", name: "A" }],
    teamB: [{ id: "ch-2", name: "B" }],
    host: { id: "", name: "" },
  },
];

function makeApprovedFetch() {
  return vi.fn().mockImplementation((url: string) => {
    if (url === "/api/me") {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({ user: ME_USER, character: { status: "approved" } }),
      });
    }
    return Promise.resolve({
      ok: true,
      status: 200,
      json: async () => ({ data: MOCK_OPERATIONS, page: { hasMore: false, nextOffset: null } }),
    });
  });
}

function makeUnapprovedFetch() {
  return vi.fn().mockImplementation((url: string) => {
    if (url === "/api/me") {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({ user: ME_USER, character: { status: "pending" } }),
      });
    }
    return Promise.resolve({ ok: true, status: 200, json: async () => ({ data: [] }) });
  });
}

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

describe("OperationPage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("OPERATION // TACTICAL HUB 라벨을 렌더링한다 (승인 시)", async () => {
    vi.stubGlobal("fetch", makeApprovedFetch());
    renderWithSWR(<DashboardSessionProvider><OperationPage /></DashboardSessionProvider>);
    expect(await screen.findByText("OPERATION // TACTICAL HUB")).toBeInTheDocument();
  });

  it("승인 상태에서 작전 카드를 표시한다", async () => {
    vi.stubGlobal("fetch", makeApprovedFetch());
    renderWithSWR(<DashboardSessionProvider><OperationPage /></DashboardSessionProvider>);
    await waitFor(() => {
      const rooms = screen.getAllByRole("article");
      expect(rooms.length).toBeGreaterThanOrEqual(2);
    });
  });

  it("승인 상태에서 OPERATION/DOWNTIME 모두 표시한다", async () => {
    vi.stubGlobal("fetch", makeApprovedFetch());
    renderWithSWR(<DashboardSessionProvider><OperationPage /></DashboardSessionProvider>);
    await waitFor(() => {
      expect(screen.getAllByText("OPERATION").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("DOWNTIME").length).toBeGreaterThanOrEqual(1);
    });
  });

  it("StrictMode에서도 /api/operations를 호출해 목록을 표시한다", async () => {
    const fetchMock = makeApprovedFetch();
    vi.stubGlobal("fetch", fetchMock);

    renderWithSWR(
      <StrictMode>
        <DashboardSessionProvider><OperationPage /></DashboardSessionProvider>
      </StrictMode>,
    );

    await waitFor(() => {
      expect(screen.getAllByRole("article").length).toBeGreaterThanOrEqual(2);
    });

    const operationCalls = fetchMock.mock.calls.filter(([url]) => String(url).startsWith("/api/operations"));
    expect(operationCalls.length).toBeGreaterThanOrEqual(1);
    expect(operationCalls.some(([url]) => String(url).includes("limit=10&offset=0"))).toBe(true);
  });

  it("미승인 상태에서 AccessDenied를 표시한다", async () => {
    vi.stubGlobal("fetch", makeUnapprovedFetch());
    renderWithSWR(<DashboardSessionProvider><OperationPage /></DashboardSessionProvider>);
    await waitFor(() => {
      expect(screen.getByText(/작전 참여 자격이 필요합니다/)).toBeInTheDocument();
    });
  });

  it("목록 재조회가 실패해도 기존 목록을 유지한다", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url === "/api/me") {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ user: ME_USER, character: { status: "approved" } }),
        });
      }

      if (String(url).startsWith("/api/operations")) {
        if (fetchMock.mock.calls.filter(([u]) => String(u).startsWith("/api/operations")).length === 1) {
          return Promise.resolve({ ok: true, status: 200, json: async () => ({ data: MOCK_OPERATIONS, page: { hasMore: false, nextOffset: null } }) });
        }
        return Promise.reject(new Error("temporary network error"));
      }

      return Promise.resolve({ ok: true, status: 200, json: async () => ({}) });
    });

    vi.stubGlobal("fetch", fetchMock);
    renderWithSWR(<DashboardSessionProvider><OperationPage /></DashboardSessionProvider>);

    await waitFor(() => {
      expect(screen.getAllByRole("article").length).toBeGreaterThanOrEqual(2);
    });

    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    await waitFor(() => {
      expect(screen.getAllByRole("article").length).toBeGreaterThanOrEqual(2);
    });
  });

  it("초기 로드 실패 후 복귀 이벤트에서 목록을 복구한다", async () => {
    let now = 0;
    const nowSpy = vi.spyOn(Date, "now").mockImplementation(() => now);

    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url === "/api/me") {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ user: ME_USER, character: { status: "approved" } }),
        });
      }

      if (String(url).startsWith("/api/operations")) {
        const attempts = fetchMock.mock.calls.filter(([u]) => String(u).startsWith("/api/operations")).length;
        if (attempts <= 1) {
          return Promise.reject(new Error("cold start timeout"));
        }
        return Promise.resolve({ ok: true, status: 200, json: async () => ({ data: MOCK_OPERATIONS, page: { hasMore: false, nextOffset: null } }) });
      }

      return Promise.resolve({ ok: true, status: 200, json: async () => ({}) });
    });

    vi.stubGlobal("fetch", fetchMock);
    renderWithSWR(<DashboardSessionProvider><OperationPage /></DashboardSessionProvider>);

    await waitFor(() => {
      const opCalls = fetchMock.mock.calls.filter(([u]) => String(u).startsWith("/api/operations"));
      expect(opCalls.length).toBe(1);
    });

    now = 2000;

    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    await waitFor(() => {
      const opCalls = fetchMock.mock.calls.filter(([u]) => String(u).startsWith("/api/operations"));
      expect(opCalls.length).toBeGreaterThanOrEqual(2);
    });

    await waitFor(() => {
      expect(screen.getAllByRole("article").length).toBeGreaterThanOrEqual(2);
    });

    nowSpy.mockRestore();
  });

  it("기본 목록 요청이 진행 중일 때 visibilitychange로 인한 추가 요청을 제한한다", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url === "/api/me") {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ user: ME_USER, character: { status: "approved" } }),
        });
      }

      if (String(url).startsWith("/api/operations")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ data: MOCK_OPERATIONS, page: { hasMore: false, nextOffset: null } }),
        });
      }

      return Promise.resolve({ ok: true, status: 200, json: async () => ({}) });
    });

    vi.stubGlobal("fetch", fetchMock);
    renderWithSWR(<DashboardSessionProvider><OperationPage /></DashboardSessionProvider>);

    await waitFor(() => {
      const opCalls = fetchMock.mock.calls.filter(([u]) => String(u).startsWith("/api/operations"));
      expect(opCalls.length).toBeGreaterThanOrEqual(1);
    });

    // MIN_REFETCH_INTERVAL_MS 이내에 visibilitychange 발생 → 차단
    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    const callsBeforeInterval = fetchMock.mock.calls.filter(([u]) => String(u).startsWith("/api/operations")).length;

    // MIN_REFETCH_INTERVAL_MS 경과 후 visibilitychange → 재조회
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    await waitFor(() => {
      const callsAfterInterval = fetchMock.mock.calls.filter(([u]) => String(u).startsWith("/api/operations")).length;
      expect(callsAfterInterval).toBeGreaterThan(callsBeforeInterval);
    });

    vi.useRealTimers();
  });
});
