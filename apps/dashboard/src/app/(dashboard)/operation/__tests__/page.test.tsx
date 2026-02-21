import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import OperationPage from "../page";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("OperationPage", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: [
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
          ],
        }),
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("OPERATION // TACTICAL HUB 라벨을 렌더링한다 (승인 시)", async () => {
    const user = userEvent.setup();
    render(<OperationPage />);
    await user.click(screen.getByText("[DEV] 승인"));
    expect(await screen.findByText("OPERATION // TACTICAL HUB")).toBeInTheDocument();
  });

  it("승인 상태에서 작전 카드를 표시한다", async () => {
    const user = userEvent.setup();
    render(<OperationPage />);
    await user.click(screen.getByText("[DEV] 승인"));
    const rooms = await screen.findAllByRole("article");
    expect(rooms.length).toBeGreaterThanOrEqual(2);
  });

  it("승인 상태에서 OPERATION/DOWNTIME 모두 표시한다", async () => {
    const user = userEvent.setup();
    render(<OperationPage />);
    await user.click(screen.getByText("[DEV] 승인"));
    expect((await screen.findAllByText("OPERATION")).length).toBeGreaterThanOrEqual(1);
    expect((await screen.findAllByText("DOWNTIME")).length).toBeGreaterThanOrEqual(1);
  });

  it("미승인 상태에서 AccessDenied를 표시한다", () => {
    render(<OperationPage />);
    expect(screen.getByText(/작전 참여 자격이 필요합니다/)).toBeInTheDocument();
  });
});
