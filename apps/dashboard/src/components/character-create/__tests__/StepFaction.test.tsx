import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { StepFaction } from "../StepFaction";

describe("StepFaction", () => {
  const defaultProps = {
    value: null as "bureau" | "static" | null,
    onChange: vi.fn(),
  };

  it("2개 팩션 카드를 렌더링한다", () => {
    render(<StepFaction {...defaultProps} />);

    expect(screen.getByText("Bureau")).toBeInTheDocument();
    expect(screen.getByText("Static")).toBeInTheDocument();
  });

  it("팩션 설명 텍스트를 표시한다", () => {
    render(<StepFaction {...defaultProps} />);

    expect(screen.getByText(/질서와 통제/)).toBeInTheDocument();
    expect(screen.getByText(/저항과 자유/)).toBeInTheDocument();
  });

  it("Bureau 선택 시 onChange 콜백을 호출한다", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<StepFaction {...defaultProps} onChange={onChange} />);
    await user.click(screen.getByText("Bureau"));

    expect(onChange).toHaveBeenCalledWith("bureau");
  });

  it("Static 선택 시 onChange 콜백을 호출한다", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<StepFaction {...defaultProps} onChange={onChange} />);
    await user.click(screen.getByText("Static"));

    expect(onChange).toHaveBeenCalledWith("static");
  });

  it("선택된 팩션에 하이라이트 스타일을 적용한다", () => {
    render(<StepFaction {...defaultProps} value="bureau" />);

    const bureauCard = screen.getByTestId("faction-bureau");
    const staticCard = screen.getByTestId("faction-static");

    expect(bureauCard).toHaveClass("border-primary");
    expect(staticCard).not.toHaveClass("border-primary");
  });

  it("미선택 시 카드에 기본 보더를 표시한다", () => {
    render(<StepFaction {...defaultProps} />);

    const bureauCard = screen.getByTestId("faction-bureau");
    const staticCard = screen.getByTestId("faction-static");

    expect(bureauCard).not.toHaveClass("border-primary");
    expect(staticCard).not.toHaveClass("border-accent");
  });
});
