import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { CharacterDraft } from "../types";
import { StepAbilityDesign } from "../StepAbilityDesign";
import { StepConfirm } from "../StepConfirm";

const BASE_DRAFT: CharacterDraft = {
  faction: "bureau",
  abilityClass: "field",
  abilityName: "시공간 왜곡",
  abilityDescription: "공간을 접어 물체를 이동시킨다",
  abilityConstraint: "시야 내 대상만 가능",
  abilityWeakness: "",
  abilityCostAmount: "",
  abilityTierBasic: "소형 물체 이동",
  abilityTierMid: "중형 물체 이동",
  abilityTierAdvanced: "공간 자체를 왜곡",
  crossoverStyle: null,
  name: "카이 리",
  gender: "남성",
  age: "24",
  appearance: "은발에 날카로운 눈매",
  personality: "냉철하지만 동료에게는 따뜻하다",
  backstory: "관리국 소속이었으나 진실을 알고 탈출했다",
  leaderApplication: false,
};

describe("StepAbilityDesign — 확장 필드", () => {
  it("약점 입력 필드를 렌더링한다", () => {
    render(<StepAbilityDesign draft={BASE_DRAFT} onChange={vi.fn()} />);
    expect(screen.getByLabelText(/약점/)).toBeInTheDocument();
  });

  it("약점 입력 시 onChange를 호출한다", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<StepAbilityDesign draft={BASE_DRAFT} onChange={onChange} />);

    await user.type(screen.getByLabelText(/약점/), "근거리 무력화 시 취약");
    expect(onChange).toHaveBeenCalled();
    /* onChange 첫 호출에서 abilityWeakness 키 포함 확인 */
    expect(onChange.mock.calls[0][0]).toHaveProperty("abilityWeakness");
  });

  it("비용 수치 입력 필드를 렌더링한다", () => {
    render(<StepAbilityDesign draft={BASE_DRAFT} onChange={vi.fn()} />);
    expect(screen.getByLabelText(/비용 수치/)).toBeInTheDocument();
  });

  it("비용 수치 입력 시 onChange를 호출한다", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<StepAbilityDesign draft={BASE_DRAFT} onChange={onChange} />);

    await user.type(screen.getByLabelText(/비용 수치/), "15");
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[0][0]).toHaveProperty("abilityCostAmount");
  });
});

describe("StepConfirm — 리더 신청", () => {
  const defaultProps = {
    draft: BASE_DRAFT,
    onSubmit: vi.fn(),
    onEditStep: vi.fn(),
  };

  it("리더 신청 체크박스를 렌더링한다", () => {
    render(<StepConfirm {...defaultProps} />);
    expect(screen.getByRole("checkbox", { name: /리더 신청/ })).toBeInTheDocument();
  });

  it("초기 상태에서 체크박스가 미체크 상태이다", () => {
    render(<StepConfirm {...defaultProps} />);
    const checkbox = screen.getByRole("checkbox", { name: /리더 신청/ });
    expect(checkbox).not.toBeChecked();
  });

  it("체크박스 클릭 시 onLeaderChange를 호출한다", async () => {
    const onLeaderChange = vi.fn();
    const user = userEvent.setup();
    render(
      <StepConfirm {...defaultProps} onLeaderChange={onLeaderChange} />,
    );

    await user.click(screen.getByRole("checkbox", { name: /리더 신청/ }));
    expect(onLeaderChange).toHaveBeenCalledWith(true);
  });

  it("leaderApplication=true이면 체크된 상태로 표시한다", () => {
    const leaderDraft = { ...BASE_DRAFT, leaderApplication: true };
    render(<StepConfirm {...defaultProps} draft={leaderDraft} />);
    const checkbox = screen.getByRole("checkbox", { name: /리더 신청/ });
    expect(checkbox).toBeChecked();
  });

  it("리더 신청 설명 텍스트를 표시한다", () => {
    render(<StepConfirm {...defaultProps} />);
    expect(screen.getByText(/작전의 리더로 활동/)).toBeInTheDocument();
  });

  it("약점 요약을 표시한다", () => {
    const draftWithWeakness = {
      ...BASE_DRAFT,
      abilityWeakness: "근접전 취약",
    };
    render(<StepConfirm {...defaultProps} draft={draftWithWeakness} />);
    expect(screen.getByText("근접전 취약")).toBeInTheDocument();
  });

  it("비용 수치를 요약에 표시한다", () => {
    const draftWithCost = {
      ...BASE_DRAFT,
      abilityCostAmount: "15",
    };
    render(<StepConfirm {...defaultProps} draft={draftWithCost} />);
    expect(screen.getByText("15")).toBeInTheDocument();
  });
});
