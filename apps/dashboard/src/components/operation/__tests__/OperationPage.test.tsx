import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { SWRConfig } from "swr";

import OperationPage from "@/app/(dashboard)/operation/page";
import { DashboardSessionProvider } from "@/components/layout/DashboardSessionProvider";

const ME_USER = { id: "u-1", email: null, displayName: "test", discordUsername: null, isAdmin: false };

const {
  mockCreateClient,
  mockSubscribe,
} = vi.hoisted(() => ({
  mockCreateClient: vi.fn(),
  mockSubscribe: vi.fn(),
}));

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: mockCreateClient,
}));

const mockFetch = vi.fn();

function makeFetchResponse(body: unknown, ok = true) {
  return Promise.resolve({
    ok,
    status: ok ? 200 : 500,
    json: () => Promise.resolve(body),
  } as Response);
}

function renderWithSWR(ui: React.ReactElement) {
  return render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      {ui}
    </SWRConfig>,
  );
}

describe("OperationPage", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", mockFetch);

    const channel = {
      on: vi.fn().mockReturnThis(),
      subscribe: mockSubscribe.mockReturnThis(),
      unsubscribe: vi.fn(),
    };

    mockCreateClient.mockReturnValue({
      channel: vi.fn(() => channel),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    mockFetch.mockReset();
    mockCreateClient.mockReset();
    mockSubscribe.mockReset();
  });

  it("로딩 중에는 빈 영역을 표시한다 (전역 스피너 위임)", () => {
    // fetch가 완료되지 않은 상태 유지
    mockFetch.mockReturnValue(new Promise(() => {}));
    const { container } = renderWithSWR(<DashboardSessionProvider><OperationPage /></DashboardSessionProvider>);
    /* 로컬 텍스트 제거 → 빈 div만 존재 */
    expect(screen.queryByText("확인 중...")).not.toBeInTheDocument();
    expect(container.querySelector(".pb-6")).toBeInTheDocument();
  });

  it("승인된 캐릭터가 있으면 OperationHub를 표시한다", async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url === "/api/me") {
        return makeFetchResponse({ user: ME_USER, character: { status: "approved" } });
      }
      if (url.startsWith("/api/operations")) {
        return makeFetchResponse({ data: [], page: { hasMore: false, nextOffset: null } });
      }
      return makeFetchResponse({});
    });

    renderWithSWR(<DashboardSessionProvider><OperationPage /></DashboardSessionProvider>);

    await waitFor(() => {
      expect(screen.getByText("OPERATION // TACTICAL HUB")).toBeInTheDocument();
    });
    expect(screen.getByText("통합 작전 목록")).toBeInTheDocument();
  });

  it("미승인 캐릭터일 때 AccessDenied를 표시한다", async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url === "/api/me") {
        return makeFetchResponse({ user: ME_USER, character: { status: "pending" } });
      }
      return makeFetchResponse({});
    });

    renderWithSWR(<DashboardSessionProvider><OperationPage /></DashboardSessionProvider>);

    await waitFor(() => {
      expect(screen.getByText("HELIOS SYSTEM // ACCESS RESTRICTED")).toBeInTheDocument();
    });
    expect(screen.getByText(/작전 참여 자격이 필요합니다/)).toBeInTheDocument();
  });

  it("캐릭터가 없을 때 AccessDenied를 표시한다", async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url === "/api/me") {
        return makeFetchResponse({ user: ME_USER, character: null });
      }
      return makeFetchResponse({});
    });

    renderWithSWR(<DashboardSessionProvider><OperationPage /></DashboardSessionProvider>);

    await waitFor(() => {
      expect(screen.getByText("HELIOS SYSTEM // ACCESS RESTRICTED")).toBeInTheDocument();
    });
  });

  it("/api/me 요청 실패 시 AccessDenied를 표시한다", async () => {
    mockFetch.mockRejectedValue(new Error("network error"));

    renderWithSWR(<DashboardSessionProvider><OperationPage /></DashboardSessionProvider>);

    await waitFor(() => {
      expect(screen.getByText("HELIOS SYSTEM // ACCESS RESTRICTED")).toBeInTheDocument();
    });
  });

  it("Realtime 이벤트 수신 시 /api/operations를 다시 조회한다", async () => {
    let realtimeHandler: (() => void) | null = null;
    const channel = {
      on: vi.fn((_event: string, _filter: unknown, cb: () => void) => {
        realtimeHandler = cb;
        return channel;
      }),
      subscribe: mockSubscribe.mockReturnThis(),
      unsubscribe: vi.fn(),
    };

    mockCreateClient.mockReturnValue({
      channel: vi.fn(() => channel),
    });

    mockFetch.mockImplementation((url: string) => {
      if (url === "/api/me") {
        return makeFetchResponse({ user: ME_USER, character: { status: "approved" } });
      }
      if (url.startsWith("/api/operations")) {
        return makeFetchResponse({ data: [], page: { hasMore: false, nextOffset: null } });
      }
      return makeFetchResponse({});
    });

    renderWithSWR(<DashboardSessionProvider><OperationPage /></DashboardSessionProvider>);

    await waitFor(() => {
      expect(screen.getByText("OPERATION // TACTICAL HUB")).toBeInTheDocument();
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/operations?limit=10&offset=0",
      expect.objectContaining({ headers: expect.any(Headers) }),
    );
    const initialCalls = mockFetch.mock.calls.filter((args) => String(args[0]).startsWith("/api/operations")).length;

    realtimeHandler?.();

    await waitFor(() => {
      const calls = mockFetch.mock.calls.filter((args) => String(args[0]).startsWith("/api/operations")).length;
      expect(calls).toBeGreaterThan(initialCalls);
    });
  });
});
