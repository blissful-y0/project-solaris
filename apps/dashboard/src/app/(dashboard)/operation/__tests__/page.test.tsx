import { StrictMode } from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, afterEach } from "vitest";

import OperationPage from "../page";

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
        json: async () => ({ character: { status: "approved" } }),
      });
    }
    return Promise.resolve({
      ok: true,
      json: async () => ({ data: MOCK_OPERATIONS, page: { hasMore: false, nextOffset: null } }),
    });
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
    return Promise.resolve({ ok: true, json: async () => ({ data: [] }) });
  });
}

describe("OperationPage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("OPERATION // TACTICAL HUB 라벨을 렌더링한다 (승인 시)", async () => {
    vi.stubGlobal("fetch", makeApprovedFetch());
    render(<OperationPage />);
    expect(await screen.findByText("OPERATION // TACTICAL HUB")).toBeInTheDocument();
  });

  it("승인 상태에서 작전 카드를 표시한다", async () => {
    vi.stubGlobal("fetch", makeApprovedFetch());
    render(<OperationPage />);
    await waitFor(() => {
      const rooms = screen.getAllByRole("article");
      expect(rooms.length).toBeGreaterThanOrEqual(2);
    });
  });

  it("승인 상태에서 OPERATION/DOWNTIME 모두 표시한다", async () => {
    vi.stubGlobal("fetch", makeApprovedFetch());
    render(<OperationPage />);
    await waitFor(() => {
      expect(screen.getAllByText("OPERATION").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("DOWNTIME").length).toBeGreaterThanOrEqual(1);
    });
  });

  it("StrictMode에서도 /api/operations를 호출해 목록을 표시한다", async () => {
    const fetchMock = makeApprovedFetch();
    vi.stubGlobal("fetch", fetchMock);

    render(
      <StrictMode>
        <OperationPage />
      </StrictMode>,
    );

    await waitFor(() => {
      expect(screen.getAllByRole("article").length).toBeGreaterThanOrEqual(2);
    });

    const operationCalls = fetchMock.mock.calls.filter(([url]) => String(url).startsWith("/api/operations"));
    expect(operationCalls.length).toBeGreaterThanOrEqual(1);
  });

  it("미승인 상태에서 AccessDenied를 표시한다", async () => {
    vi.stubGlobal("fetch", makeUnapprovedFetch());
    render(<OperationPage />);
    await waitFor(() => {
      expect(screen.getByText(/작전 참여 자격이 필요합니다/)).toBeInTheDocument();
    });
  });

  it("목록 재조회가 실패해도 기존 목록을 유지한다", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url === "/api/me") {
        return Promise.resolve({
          ok: true,
          json: async () => ({ character: { status: "approved" } }),
        });
      }

      if (String(url).startsWith("/api/operations")) {
        if (fetchMock.mock.calls.filter(([u]) => String(u).startsWith("/api/operations")).length === 1) {
          return Promise.resolve({ ok: true, json: async () => ({ data: MOCK_OPERATIONS, page: { hasMore: false, nextOffset: null } }) });
        }
        return Promise.reject(new Error("temporary network error"));
      }

      return Promise.resolve({ ok: true, json: async () => ({}) });
    });

    vi.stubGlobal("fetch", fetchMock);
    render(<OperationPage />);

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
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url === "/api/me") {
        return Promise.resolve({
          ok: true,
          json: async () => ({ character: { status: "approved" } }),
        });
      }

      if (String(url).startsWith("/api/operations")) {
        const attempts = fetchMock.mock.calls.filter(([u]) => String(u).startsWith("/api/operations")).length;
        if (attempts <= 1) {
          return Promise.reject(new Error("cold start timeout"));
        }
        return Promise.resolve({ ok: true, json: async () => ({ data: MOCK_OPERATIONS, page: { hasMore: false, nextOffset: null } }) });
      }

      return Promise.resolve({ ok: true, json: async () => ({}) });
    });

    vi.stubGlobal("fetch", fetchMock);
    render(<OperationPage />);

    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    await waitFor(() => {
      expect(screen.getAllByRole("article").length).toBeGreaterThanOrEqual(2);
    });
  });

  it("이전 요청이 늦게 실패해도 최신 성공 응답을 덮어쓰지 않는다", async () => {
    let rejectFirstOpsRequest: ((reason?: unknown) => void) | null = null;

    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url === "/api/me") {
        return Promise.resolve({
          ok: true,
          json: async () => ({ character: { status: "approved" } }),
        });
      }

      if (String(url).startsWith("/api/operations")) {
        const attempts = fetchMock.mock.calls.filter(([u]) => String(u).startsWith("/api/operations")).length;
        if (attempts === 1) {
          return new Promise((_, reject) => {
            rejectFirstOpsRequest = reject;
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: MOCK_OPERATIONS, page: { hasMore: false, nextOffset: null } }),
        });
      }

      return Promise.resolve({ ok: true, json: async () => ({}) });
    });

    vi.stubGlobal("fetch", fetchMock);
    render(<OperationPage />);

    await waitFor(() => {
      const opCalls = fetchMock.mock.calls.filter(([u]) => String(u).startsWith("/api/operations"));
      expect(opCalls.length).toBeGreaterThanOrEqual(1);
    });

    await act(async () => {
      await Promise.resolve();
      document.dispatchEvent(new Event("visibilitychange"));
    });

    await waitFor(() => {
      expect(screen.getAllByRole("article").length).toBeGreaterThanOrEqual(2);
    });

    await act(async () => {
      rejectFirstOpsRequest?.(new Error("late network fail"));
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screen.getAllByRole("article").length).toBeGreaterThanOrEqual(2);
    });
  });
});
