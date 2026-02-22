import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SWRConfig } from "swr";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AdminCharactersPage from "../page";

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

describe("AdminCharactersPage", () => {
  const MOCK_ROW = {
    id: "char_1",
    name: "테스터",
    faction: "bureau",
    resonance_rate: 80,
    leader_application: true,
    is_leader: false,
    abilities: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("큐를 렌더링하고 승인 확인 모달을 거쳐 요청을 보낸다", async () => {
    const fetchMock = vi
      .fn()
      /* 초기 큐 로드 */
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [MOCK_ROW] }),
      })
      /* approve API */
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { id: "char_1", status: "approved" } }),
      })
      /* 큐 리로드 */
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    renderWithSWR(<AdminCharactersPage />);

    /* 큐 렌더 확인 */
    await waitFor(() => {
      expect(screen.getByText("테스터")).toBeInTheDocument();
    });

    /* 테이블 행의 "승인" 버튼 클릭 → 확인 모달 표시 */
    const approveButtons = screen.getAllByRole("button", { name: "승인" });
    await user.click(approveButtons[0]);

    /* 모달 내 확인 메시지 확인 */
    await waitFor(() => {
      expect(screen.getByText(/승인하시겠습니까/)).toBeInTheDocument();
    });

    /* 모달 내 "승인" 버튼 클릭 → API 호출 */
    const modalApproveBtn = screen.getAllByRole("button", { name: "승인" });
    await user.click(modalApproveBtn[modalApproveBtn.length - 1]);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/admin/characters/char_1/approve",
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  it("반려 시 사유 모달을 표시하고 사유와 함께 요청을 보낸다", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [MOCK_ROW] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { id: "char_1", status: "rejected" } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    renderWithSWR(<AdminCharactersPage />);

    await waitFor(() => {
      expect(screen.getByText("테스터")).toBeInTheDocument();
    });

    /* "반려" 버튼 클릭 → 사유 모달 표시 */
    await user.click(screen.getByRole("button", { name: "반려" }));

    await waitFor(() => {
      expect(screen.getByText(/반려 사유를 입력하세요/)).toBeInTheDocument();
    });

    /* 사유 입력 (20자 이상) */
    const textarea = screen.getByPlaceholderText(/반려 사유를 입력하세요/);
    await user.type(textarea, "능력 코스트가 불균형합니다. 기본기 코스트를 재조정해 주세요.");

    /* 모달 내 "반려" 버튼 클릭 */
    const rejectButtons = screen.getAllByRole("button", { name: "반려" });
    await user.click(rejectButtons[rejectButtons.length - 1]);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/admin/characters/char_1/reject",
        expect.objectContaining({
          method: "POST",
          headers: { "content-type": "application/json" },
        }),
      );
    });
  });

  it("권한 없을 때 Access Denied를 표시한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ error: "FORBIDDEN" }),
      }),
    );

    renderWithSWR(<AdminCharactersPage />);

    await waitFor(() => {
      expect(screen.getByText("ACCESS DENIED")).toBeInTheDocument();
    });
  });
});
