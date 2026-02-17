import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { CharacterDraft } from "../types";
import { StepConfirm } from "../StepConfirm";

const FULL_DRAFT: CharacterDraft = {
  faction: "bureau",
  abilityClass: "field",
  abilityName: "시공간 왜곡",
  abilityDescription: "공간을 접어 물체를 이동시킨다",
  abilityConstraint: "시야 내 대상만 가능",
  abilityTierBasic: "소형 물체 이동",
  abilityTierMid: "중형 물체 이동, 단거리 순간이동",
  abilityTierAdvanced: "공간 자체를 왜곡, 대규모 이동",
  abilityCostType: "will",
  name: "카이 리",
  gender: "남성",
  age: "24",
  appearance: "은발에 날카로운 눈매",
  personality: "냉철하지만 동료에게는 따뜻하다",
  backstory: "관리국 소속이었으나 진실을 알고 탈출했다",
};

describe("StepConfirm", () => {
  const defaultProps = {
    draft: FULL_DRAFT,
    onSubmit: vi.fn(),
    onEditStep: vi.fn(),
  };

  it("팩션을 표시한다", () => {
    render(<StepConfirm {...defaultProps} />);
    expect(screen.getByText(/Bureau/i)).toBeInTheDocument();
  });

  it("능력 계열을 표시한다", () => {
    render(<StepConfirm {...defaultProps} />);
    expect(screen.getByText(/Field/i)).toBeInTheDocument();
  });

  it("능력 이름을 표시한다", () => {
    render(<StepConfirm {...defaultProps} />);
    expect(screen.getByText("시공간 왜곡")).toBeInTheDocument();
  });

  it("캐릭터 이름을 표시한다", () => {
    render(<StepConfirm {...defaultProps} />);
    expect(screen.getByText("카이 리")).toBeInTheDocument();
  });

  it("제출 버튼을 렌더링한다", () => {
    render(<StepConfirm {...defaultProps} />);
    expect(screen.getByRole("button", { name: /제출/ })).toBeInTheDocument();
  });

  it("제출 버튼 클릭 시 onSubmit을 호출한다", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    render(<StepConfirm {...defaultProps} onSubmit={onSubmit} />);
    await user.click(screen.getByRole("button", { name: /제출/ }));

    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("수정하기 버튼으로 해당 스텝으로 이동한다", async () => {
    const onEditStep = vi.fn();
    const user = userEvent.setup();

    render(<StepConfirm {...defaultProps} onEditStep={onEditStep} />);

    // 각 섹션의 수정 버튼
    const editButtons = screen.getAllByRole("button", { name: /수정/ });
    expect(editButtons.length).toBeGreaterThanOrEqual(1);

    await user.click(editButtons[0]);
    expect(onEditStep).toHaveBeenCalled();
  });
});
