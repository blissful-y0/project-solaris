import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { AbilityClass } from "../types";
import { StepAbilityClass } from "../StepAbilityClass";

describe("StepAbilityClass", () => {
  const defaultProps = {
    value: null as AbilityClass | null,
    onChange: vi.fn(),
  };

  it("4개 계열 카드를 렌더링한다", () => {
    render(<StepAbilityClass {...defaultProps} />);

    expect(screen.getByText("Field")).toBeInTheDocument();
    expect(screen.getByText("Empathy")).toBeInTheDocument();
    expect(screen.getByText("Shift")).toBeInTheDocument();
    expect(screen.getByText("Compute")).toBeInTheDocument();
  });

  it("각 계열의 설명을 표시한다", () => {
    render(<StepAbilityClass {...defaultProps} />);

    expect(screen.getByText(/공간과 에너지를 조작/)).toBeInTheDocument();
    expect(screen.getByText(/감정과 정신에 작용/)).toBeInTheDocument();
    expect(screen.getByText(/물질과 신체를 변형/)).toBeInTheDocument();
    expect(screen.getByText(/정보와 확률을 연산/)).toBeInTheDocument();
  });

  it("계열 선택 시 onChange 콜백을 호출한다", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<StepAbilityClass {...defaultProps} onChange={onChange} />);
    await user.click(screen.getByText("Shift"));

    expect(onChange).toHaveBeenCalledWith("shift");
  });

  it("선택된 계열에 하이라이트를 적용한다", () => {
    render(<StepAbilityClass {...defaultProps} value="compute" />);

    const computeCard = screen.getByTestId("ability-class-compute");
    expect(computeCard).toHaveClass("border-primary");
  });

  it("미선택 계열은 기본 보더를 표시한다", () => {
    render(<StepAbilityClass {...defaultProps} value="field" />);

    const empathyCard = screen.getByTestId("ability-class-empathy");
    expect(empathyCard).not.toHaveClass("border-primary");
  });
});
