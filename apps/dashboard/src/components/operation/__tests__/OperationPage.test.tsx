import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import OperationPage from "@/app/(dashboard)/operation/page";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("OperationPage", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "development");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("초기 상태(승인)에서 OperationHub를 표시한다", () => {
    render(<OperationPage />);
    expect(screen.getByText("OPERATION // TACTICAL HUB")).toBeInTheDocument();
    expect(screen.getByText("통합 작전 목록")).toBeInTheDocument();
  });

  it("DEV 토글에서 미승인 상태로 전환하면 AccessDenied를 표시한다", async () => {
    const user = userEvent.setup();
    render(<OperationPage />);

    const unapprovedBtn = screen.getByText("[DEV] 미승인");
    await user.click(unapprovedBtn);

    expect(screen.getByText("HELIOS SYSTEM")).toBeInTheDocument();
    expect(screen.getByText(/작전 참여 자격이 필요합니다/)).toBeInTheDocument();
  });

  it("DEV 토글 버튼들이 존재한다", () => {
    render(<OperationPage />);
    expect(screen.getByText("[DEV] 미승인")).toBeInTheDocument();
    expect(screen.getByText("[DEV] 승인")).toBeInTheDocument();
  });

  it("미승인 상태에서 캐릭터 생성 링크를 제공한다", async () => {
    const user = userEvent.setup();
    render(<OperationPage />);
    await user.click(screen.getByText("[DEV] 미승인"));
    expect(screen.getByText("캐릭터 생성하러 가기")).toBeInTheDocument();
  });
});
