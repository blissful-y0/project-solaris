import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { EMPTY_DRAFT, type CharacterDraft } from "../types";
import { StepAbilityDesign } from "../StepAbilityDesign";

const bureauDraft = { ...EMPTY_DRAFT, faction: "bureau" as const };
const staticDraft = { ...EMPTY_DRAFT, faction: "static" as const };

describe("StepAbilityDesign", () => {
  const onChange = vi.fn() as (patch: Partial<CharacterDraft>) => void;

  it("능력 이름 입력 필드를 렌더링한다", () => {
    render(<StepAbilityDesign draft={bureauDraft} onChange={onChange} />);
    expect(screen.getByLabelText(/능력 이름/)).toBeInTheDocument();
  });

  it("능력 설명 textarea를 렌더링한다", () => {
    render(<StepAbilityDesign draft={bureauDraft} onChange={onChange} />);
    expect(screen.getByLabelText(/능력 설명/)).toBeInTheDocument();
  });

  it("제약 사항 textarea를 렌더링한다", () => {
    render(<StepAbilityDesign draft={bureauDraft} onChange={onChange} />);
    expect(screen.getByLabelText(/제약 사항/)).toBeInTheDocument();
  });

  it("단계별 textarea를 렌더링한다 (기본기/중급기/상급기)", () => {
    render(<StepAbilityDesign draft={bureauDraft} onChange={onChange} />);
    expect(screen.getByLabelText(/기본기/)).toBeInTheDocument();
    expect(screen.getByLabelText(/중급기/)).toBeInTheDocument();
    expect(screen.getByLabelText(/상급기/)).toBeInTheDocument();
  });

  it("Bureau 선택 시 하모닉스 프로토콜 표시", () => {
    render(<StepAbilityDesign draft={bureauDraft} onChange={onChange} />);
    expect(screen.getByText(/하모닉스 프로토콜/)).toBeInTheDocument();
  });

  it("Static 선택 시 오버드라이브 표시", () => {
    render(<StepAbilityDesign draft={staticDraft} onChange={onChange} />);
    expect(screen.getAllByText(/오버드라이브/).length).toBeGreaterThan(0);
  });

  it("Bureau에서 리미터 해제 크로스오버를 표시한다", () => {
    render(<StepAbilityDesign draft={bureauDraft} onChange={onChange} />);
    expect(screen.getByTestId("crossover-limiter-override")).toBeInTheDocument();
  });

  it("Static에서 3가지 크로스오버를 표시한다", () => {
    render(<StepAbilityDesign draft={staticDraft} onChange={onChange} />);
    expect(screen.getByTestId("crossover-hardware-bypass")).toBeInTheDocument();
    expect(screen.getByTestId("crossover-dead-reckoning")).toBeInTheDocument();
    expect(screen.getByTestId("crossover-defector")).toBeInTheDocument();
  });

  it("능력 이름 입력 시 onChange를 호출한다", async () => {
    const onChangeFn = vi.fn();
    const user = userEvent.setup();

    render(<StepAbilityDesign draft={bureauDraft} onChange={onChangeFn} />);
    await user.type(screen.getByLabelText(/능력 이름/), "화");

    expect(onChangeFn).toHaveBeenCalledWith(expect.objectContaining({ abilityName: "화" }));
  });

  it("크로스오버 선택 시 onChange를 호출한다", async () => {
    const onChangeFn = vi.fn();
    const user = userEvent.setup();

    render(<StepAbilityDesign draft={staticDraft} onChange={onChangeFn} />);
    await user.click(screen.getByTestId("crossover-defector"));

    expect(onChangeFn).toHaveBeenCalledWith({ crossoverStyle: "defector" });
  });
});
