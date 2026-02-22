import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { OperationHub } from "../OperationHub";
import { mockOperations } from "../mock-operation-data";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));
vi.mock("@/components/layout/DashboardSessionProvider", () => ({
  useDashboardSession: () => ({
    me: { user: { isAdmin: true } },
  }),
}));

/** MAIN STORY를 제외한 일반 목록 */
const regularOps = mockOperations.filter((op) => !op.isMainStory);

describe("OperationHub", () => {
  it("OPERATION // TACTICAL HUB 라벨을 표시한다", () => {
    render(<OperationHub operations={mockOperations} />);
    expect(screen.getByText("OPERATION // TACTICAL HUB")).toBeInTheDocument();
  });

  it("통합 작전 목록 타이틀을 표시한다", () => {
    render(<OperationHub operations={mockOperations} />);
    expect(screen.getByText("통합 작전 목록")).toBeInTheDocument();
  });

  it("작전 개수를 표시한다", () => {
    render(<OperationHub operations={mockOperations} />);
    expect(
      screen.getByText(`${mockOperations.length}개 채널`),
    ).toBeInTheDocument();
  });

  it("MAIN STORY 배너를 표시한다", () => {
    render(<OperationHub operations={mockOperations} />);
    expect(screen.getByText(/MAIN STORY/)).toBeInTheDocument();
  });

  it("일반 목록 카드를 표시한다 (MAIN STORY 제외)", () => {
    render(<OperationHub operations={mockOperations} />);
    const articles = screen.getAllByRole("article");
    expect(articles).toHaveLength(regularOps.length);
  });

  it("+ 새 작전 버튼을 표시한다", () => {
    render(<OperationHub operations={mockOperations} />);
    expect(screen.getByText("+ 새 작전")).toBeInTheDocument();
  });

  it("OPERATION 필터 클릭 시 OPERATION 카드만 표시한다", async () => {
    const user = userEvent.setup();
    render(<OperationHub operations={mockOperations} />);

    const opFilter = screen.getByRole("button", { name: "OPERATION" });
    await user.click(opFilter);

    const articles = screen.getAllByRole("article");
    const opCount = regularOps.filter((op) => op.type === "operation").length;
    expect(articles).toHaveLength(opCount);
  });

  it("DOWNTIME 필터 클릭 시 DOWNTIME 카드만 표시한다", async () => {
    const user = userEvent.setup();
    render(<OperationHub operations={mockOperations} />);

    const dtFilter = screen.getByRole("button", { name: "DOWNTIME" });
    await user.click(dtFilter);

    const articles = screen.getAllByRole("article");
    const dtCount = regularOps.filter((op) => op.type === "downtime").length;
    expect(articles).toHaveLength(dtCount);
  });

  it("LIVE 상태 필터로 필터링한다", async () => {
    const user = userEvent.setup();
    render(<OperationHub operations={mockOperations} />);

    const liveFilter = screen.getByRole("button", { name: "LIVE" });
    await user.click(liveFilter);

    const articles = screen.getAllByRole("article");
    const liveCount = regularOps.filter((op) => op.status === "live").length;
    expect(articles).toHaveLength(liveCount);
  });

  it("대기 상태 필터로 필터링한다", async () => {
    const user = userEvent.setup();
    render(<OperationHub operations={mockOperations} />);

    const waitFilter = screen.getByRole("button", { name: "대기" });
    await user.click(waitFilter);

    const articles = screen.getAllByRole("article");
    const waitCount = regularOps.filter((op) => op.status === "waiting").length;
    expect(articles).toHaveLength(waitCount);
  });

  it("빈 목록에서 빈 메시지를 표시한다", () => {
    render(<OperationHub operations={[]} />);
    expect(screen.getByText(/등록된 작전이 없습니다/)).toBeInTheDocument();
  });

  it("필터 결과 0건 시 다른 빈 메시지를 표시한다", async () => {
    const user = userEvent.setup();
    /* 모든 데이터가 operation인 목록으로 테스트 */
    const onlyOps = mockOperations.filter(
      (op) => op.type === "operation" && !op.isMainStory,
    );
    render(<OperationHub operations={onlyOps} />);

    /* DOWNTIME 필터 클릭 → 결과 0건 */
    const dtFilter = screen.getByRole("button", { name: "DOWNTIME" });
    await user.click(dtFilter);

    expect(screen.getByText(/조건에 맞는 작전이 없습니다/)).toBeInTheDocument();
  });

  it("+ 새 작전 클릭 시 생성 모달이 열린다", async () => {
    const user = userEvent.setup();
    render(<OperationHub operations={mockOperations} />);

    /* '+ 새 작전' 버튼은 2개 (헤더 + 빈 상태) 중 첫 번째 */
    const newBtn = screen.getAllByText("+ 새 작전")[0];
    await user.click(newBtn);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("NEW OPERATION // 작전 생성")).toBeInTheDocument();
  });
});
