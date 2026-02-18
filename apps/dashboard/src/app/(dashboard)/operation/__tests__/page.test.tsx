import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import OperationPage from "../page";

describe("OperationPage", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "development");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("OPERATION // TACTICAL HUB 라벨을 렌더링한다 (승인 시)", async () => {
    const user = userEvent.setup();
    render(<OperationPage />);
    await user.click(screen.getByText("[DEV] 승인"));
    expect(screen.getByText("OPERATION // TACTICAL HUB")).toBeInTheDocument();
  });

  it("승인 상태에서 작전 카드를 표시한다", async () => {
    const user = userEvent.setup();
    render(<OperationPage />);
    await user.click(screen.getByText("[DEV] 승인"));
    const rooms = screen.getAllByRole("article");
    expect(rooms.length).toBeGreaterThanOrEqual(3);
  });

  it("승인 상태에서 전투/RP 모두 표시한다", async () => {
    const user = userEvent.setup();
    render(<OperationPage />);
    await user.click(screen.getByText("[DEV] 승인"));
    expect(screen.getAllByText("전투").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("RP").length).toBeGreaterThanOrEqual(1);
  });

  it("미승인 상태에서 AccessDenied를 표시한다", () => {
    render(<OperationPage />);
    expect(screen.getByText(/작전 참여 자격이 필요합니다/)).toBeInTheDocument();
  });
});
