import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

import { ActionInput } from "../ActionInput";
import type { BattleParticipant } from "../types";

const myParticipant: BattleParticipant = {
  id: "p1",
  name: "카이 안데르센",
  faction: "bureau",
  team: "ally",
  hp: { current: 64, max: 80 },
  will: { current: 198, max: 250 },
  abilities: [
    { id: "a1", name: "역장 전개", tier: "basic", costHp: 0, costWill: 5 },
    { id: "a2", name: "압축 역장", tier: "mid", costHp: 0, costWill: 12 },
    { id: "a3", name: "역장 폭쇄", tier: "advanced", costHp: 0, costWill: 25 },
  ],
};

const enemy: BattleParticipant = {
  id: "p2",
  name: "나디아 볼코프",
  faction: "static",
  team: "enemy",
  hp: { current: 72, max: 120 },
  will: { current: 138, max: 150 },
  abilities: [],
};

const defaultProps = {
  phase: "my_turn" as const,
  currentTurn: 2,
  myParticipant,
  allies: [myParticipant],
  enemies: [enemy],
  onSubmit: vi.fn(),
};

describe("ActionInput", () => {
  it("내 차례일 때 행동 칩 3개와 능력/대상 드롭다운을 렌더링한다", () => {
    render(<ActionInput {...defaultProps} />);

    expect(screen.getByTestId("action-attack")).toBeInTheDocument();
    expect(screen.getByTestId("action-defend")).toBeInTheDocument();
    expect(screen.getByTestId("action-support")).toBeInTheDocument();
    expect(screen.queryByTestId("action-disrupt")).not.toBeInTheDocument();
    expect(screen.getByTestId("ability-select")).toBeInTheDocument();
    expect(screen.getByTestId("target-select")).toBeInTheDocument();
  });

  it("턴 번호를 표시한다", () => {
    render(<ActionInput {...defaultProps} />);
    expect(screen.getByText("T2")).toBeInTheDocument();
  });

  it("능력 드롭다운에 내 능력 목록이 표시된다", () => {
    render(<ActionInput {...defaultProps} />);

    expect(screen.getByText(/역장 전개/)).toBeInTheDocument();
    expect(screen.getByText(/압축 역장/)).toBeInTheDocument();
  });

  it("attack 선택 시 적군이 대상 목록에 표시된다", () => {
    render(<ActionInput {...defaultProps} />);

    /* attack이 기본 선택이므로 적군이 대상 목록에 표시 */
    expect(screen.getByText("나디아 볼코프")).toBeInTheDocument();
  });

  it("defend 선택 시 아군이 대상 목록에 표시된다", async () => {
    const user = userEvent.setup();
    render(<ActionInput {...defaultProps} />);

    await user.click(screen.getByTestId("action-defend"));

    const targetSelect = screen.getByTestId("target-select");
    const options = targetSelect.querySelectorAll("option");
    const optionTexts = Array.from(options).map((o) => o.textContent);
    expect(optionTexts).toContain("카이 안데르센");
  });

  it("능력 선택 시 코스트 프리뷰가 표시된다", async () => {
    const user = userEvent.setup();
    render(<ActionInput {...defaultProps} />);

    await user.selectOptions(screen.getByTestId("ability-select"), "a1");

    expect(screen.getByText(/WILL 198 → 193/)).toBeInTheDocument();
  });

  it("모든 필드 입력 + 서술 작성 후 제출 가능하다", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<ActionInput {...defaultProps} onSubmit={onSubmit} />);

    await user.selectOptions(screen.getByTestId("ability-select"), "a1");
    await user.selectOptions(screen.getByTestId("target-select"), "p2");
    await user.type(screen.getByTestId("narration-input"), "역장을 전개한다.");

    const submitBtn = screen.getByTestId("submit-btn");
    expect(submitBtn).not.toBeDisabled();
    await user.click(submitBtn);

    expect(onSubmit).toHaveBeenCalledWith({
      actionType: "attack",
      abilityId: "a1",
      targetId: "p2",
      narration: "역장을 전개한다.",
    });
  });

  it("서술 미입력 시 제출 버튼이 비활성화된다", async () => {
    const user = userEvent.setup();
    render(<ActionInput {...defaultProps} />);

    await user.selectOptions(screen.getByTestId("ability-select"), "a1");
    await user.selectOptions(screen.getByTestId("target-select"), "p2");

    expect(screen.getByTestId("submit-btn")).toBeDisabled();
  });

  it("한글 조합 중 Enter는 제출하지 않는다", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<ActionInput {...defaultProps} onSubmit={onSubmit} />);

    await user.selectOptions(screen.getByTestId("ability-select"), "a1");
    await user.selectOptions(screen.getByTestId("target-select"), "p2");

    const input = screen.getByTestId("narration-input");
    await user.type(input, "ㅋㅋㅋ");

    fireEvent.keyDown(input, {
      key: "Enter",
      shiftKey: false,
      isComposing: true,
      keyCode: 229,
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("코스트 부족 시 경고 표시 + 제출 비활성화", async () => {
    const lowWillParticipant: BattleParticipant = {
      ...myParticipant,
      will: { current: 3, max: 250 },
    };
    const user = userEvent.setup();
    render(<ActionInput {...defaultProps} myParticipant={lowWillParticipant} allies={[lowWillParticipant]} />);

    await user.selectOptions(screen.getByTestId("ability-select"), "a1");

    expect(screen.getByTestId("cost-warning")).toHaveTextContent("WILL이 부족합니다");
  });

  it("waiting 상태에서는 대기 메시지를 표시한다", () => {
    render(<ActionInput {...defaultProps} phase="waiting" />);
    expect(screen.getByText("상대의 서술을 기다리는 중...")).toBeInTheDocument();
  });

  it("both_submitted 상태에서는 판정 진행 버튼을 표시한다", () => {
    render(<ActionInput {...defaultProps} phase="both_submitted" />);
    expect(screen.getByText("양측 서술 완료. 판정을 진행하세요.")).toBeInTheDocument();
    expect(screen.getByText("판정 진행")).toBeInTheDocument();
  });

  it("judging 상태에서는 로딩 메시지를 표시한다", () => {
    render(<ActionInput {...defaultProps} phase="judging" />);
    expect(screen.getByText("HELIOS 판정 처리 중...")).toBeInTheDocument();
  });

});
