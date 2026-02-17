import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { EMPTY_DRAFT, type CharacterDraft } from "../types";
import { StepAbilityDesign } from "../StepAbilityDesign";

describe("StepAbilityDesign", () => {
  const defaultProps = {
    draft: EMPTY_DRAFT,
    onChange: vi.fn() as (patch: Partial<CharacterDraft>) => void,
  };

  it("능력 이름 입력 필드를 렌더링한다", () => {
    render(<StepAbilityDesign {...defaultProps} />);
    expect(screen.getByLabelText(/능력 이름/)).toBeInTheDocument();
  });

  it("능력 설명 textarea를 렌더링한다", () => {
    render(<StepAbilityDesign {...defaultProps} />);
    expect(screen.getByLabelText(/능력 설명/)).toBeInTheDocument();
  });

  it("제약 사항 textarea를 렌더링한다", () => {
    render(<StepAbilityDesign {...defaultProps} />);
    expect(screen.getByLabelText(/제약 사항/)).toBeInTheDocument();
  });

  it("티어별 textarea를 렌더링한다", () => {
    render(<StepAbilityDesign {...defaultProps} />);
    expect(screen.getByLabelText(/기본 단계/)).toBeInTheDocument();
    expect(screen.getByLabelText(/중급 단계/)).toBeInTheDocument();
    expect(screen.getByLabelText(/상급 단계/)).toBeInTheDocument();
  });

  it("비용 타입 라디오 버튼을 렌더링한다", () => {
    render(<StepAbilityDesign {...defaultProps} />);
    expect(screen.getByLabelText("Will")).toBeInTheDocument();
    expect(screen.getByLabelText("HP")).toBeInTheDocument();
  });

  it("능력 이름 입력 시 onChange를 호출한다", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<StepAbilityDesign {...defaultProps} onChange={onChange} />);
    await user.type(screen.getByLabelText(/능력 이름/), "화염");

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ abilityName: "화" }));
  });

  it("비용 타입 선택 시 onChange를 호출한다", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<StepAbilityDesign {...defaultProps} onChange={onChange} />);
    await user.click(screen.getByLabelText("HP"));

    expect(onChange).toHaveBeenCalledWith({ abilityCostType: "hp" });
  });

  it("기존 값을 표시한다", () => {
    const draft = { ...EMPTY_DRAFT, abilityName: "기존 능력", abilityCostType: "will" as const };
    render(<StepAbilityDesign {...defaultProps} draft={draft} />);

    expect(screen.getByLabelText(/능력 이름/)).toHaveValue("기존 능력");
    expect(screen.getByLabelText("Will")).toBeChecked();
  });
});
