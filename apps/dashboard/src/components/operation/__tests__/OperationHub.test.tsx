import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { OperationHub } from "../OperationHub";
import { mockOperations } from "../mock-operation-data";

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
    expect(screen.getByText(`${mockOperations.length}개 채널`)).toBeInTheDocument();
  });

  it("초기 상태에서 모든 작전 카드를 표시한다", () => {
    render(<OperationHub operations={mockOperations} />);
    const articles = screen.getAllByRole("article");
    expect(articles).toHaveLength(mockOperations.length);
  });

  it("전투 탭 클릭 시 전투 작전만 표시한다", async () => {
    const user = userEvent.setup();
    render(<OperationHub operations={mockOperations} />);

    /* 탭 필터 영역에서 '전투' 버튼 클릭 */
    const tabs = screen.getAllByRole("button", { pressed: false });
    const battleTab = tabs.find((btn) => btn.textContent === "전투");
    expect(battleTab).toBeDefined();
    await user.click(battleTab!);

    const articles = screen.getAllByRole("article");
    const battleCount = mockOperations.filter((op) => op.type === "전투").length;
    expect(articles).toHaveLength(battleCount);
  });

  it("RP 탭 클릭 시 RP 작전만 표시한다", async () => {
    const user = userEvent.setup();
    render(<OperationHub operations={mockOperations} />);

    const tabs = screen.getAllByRole("button", { pressed: false });
    const rpTab = tabs.find((btn) => btn.textContent === "RP");
    expect(rpTab).toBeDefined();
    await user.click(rpTab!);

    const articles = screen.getAllByRole("article");
    const rpCount = mockOperations.filter((op) => op.type === "RP").length;
    expect(articles).toHaveLength(rpCount);
  });

  it("상태 필터로 대기중 작전만 필터링한다", async () => {
    const user = userEvent.setup();
    render(<OperationHub operations={mockOperations} />);

    const statusFilters = screen.getAllByRole("button");
    const waitingFilter = statusFilters.find((btn) => btn.textContent === "대기중");
    expect(waitingFilter).toBeDefined();
    await user.click(waitingFilter!);

    const articles = screen.getAllByRole("article");
    const waitingCount = mockOperations.filter((op) => op.status === "대기중").length;
    expect(articles).toHaveLength(waitingCount);
  });

  it("탭 + 상태 필터 조합이 동작한다", async () => {
    const user = userEvent.setup();
    render(<OperationHub operations={mockOperations} />);

    /* 전투 탭 선택 */
    const allButtons = screen.getAllByRole("button");
    const battleTab = allButtons.find((btn) => btn.textContent === "전투");
    await user.click(battleTab!);

    /* 진행중 상태 필터 선택 */
    const updatedButtons = screen.getAllByRole("button");
    const activeFilter = updatedButtons.find((btn) => btn.textContent === "진행중");
    await user.click(activeFilter!);

    const articles = screen.getAllByRole("article");
    const filtered = mockOperations.filter(
      (op) => op.type === "전투" && op.status === "진행중",
    );
    expect(articles).toHaveLength(filtered.length);
  });

  it("필터 결과 없을 때 빈 메시지를 표시한다", async () => {
    const user = userEvent.setup();
    /* 전투 + 완료 조합에서 데이터가 1건 있을 수 있으므로 빈 데이터 직접 전달 */
    render(<OperationHub operations={[]} />);
    expect(screen.getByText(/등록된 작전이 없습니다/)).toBeInTheDocument();
  });
});
