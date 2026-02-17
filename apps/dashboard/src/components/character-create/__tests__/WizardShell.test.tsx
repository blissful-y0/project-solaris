import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { WizardShell } from "../WizardShell";

// sonner mock
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), info: vi.fn() },
}));

describe("WizardShell", () => {
  it("스텝 인디케이터를 표시한다", () => {
    render(<WizardShell />);
    expect(screen.getByText("1 / 5")).toBeInTheDocument();
  });

  it("첫 스텝에서 StepFaction을 렌더링한다", () => {
    render(<WizardShell />);
    expect(screen.getByText("Bureau")).toBeInTheDocument();
    expect(screen.getByText("Static")).toBeInTheDocument();
  });

  it("이전 버튼이 첫 스텝에서 비활성화된다", () => {
    render(<WizardShell />);
    expect(screen.getByRole("button", { name: /이전/ })).toBeDisabled();
  });

  it("팩션 미선택 시 다음 버튼이 비활성화된다", () => {
    render(<WizardShell />);
    expect(screen.getByRole("button", { name: /다음/ })).toBeDisabled();
  });

  it("팩션 선택 후 다음 버튼이 활성화된다", async () => {
    const user = userEvent.setup();
    render(<WizardShell />);

    await user.click(screen.getByText("Bureau"));
    expect(screen.getByRole("button", { name: /다음/ })).toBeEnabled();
  });

  it("다음 클릭 시 스텝이 증가한다", async () => {
    const user = userEvent.setup();
    render(<WizardShell />);

    // Step 1: 팩션 선택
    await user.click(screen.getByText("Bureau"));
    await user.click(screen.getByRole("button", { name: /다음/ }));

    // Step 2
    expect(screen.getByText("2 / 5")).toBeInTheDocument();
    expect(screen.getByText("Field")).toBeInTheDocument();
  });

  it("이전 클릭 시 스텝이 감소한다", async () => {
    const user = userEvent.setup();
    render(<WizardShell />);

    // Step 1 → Step 2
    await user.click(screen.getByText("Bureau"));
    await user.click(screen.getByRole("button", { name: /다음/ }));
    expect(screen.getByText("2 / 5")).toBeInTheDocument();

    // Step 2 → Step 1
    await user.click(screen.getByRole("button", { name: /이전/ }));
    expect(screen.getByText("1 / 5")).toBeInTheDocument();
  });

  it("스텝 라벨을 표시한다", () => {
    render(<WizardShell />);
    expect(screen.getByText(/팩션 선택/)).toBeInTheDocument();
  });

  it("5단계 전체를 통과할 수 있다", async () => {
    const user = userEvent.setup();
    render(<WizardShell />);

    // Step 1: 팩션 선택
    await user.click(screen.getByText("Bureau"));
    await user.click(screen.getByRole("button", { name: /다음/ }));

    // Step 2: 능력 계열 선택
    await user.click(screen.getByText("Field"));
    await user.click(screen.getByRole("button", { name: /다음/ }));

    // Step 3: 능력 설계 (필수 필드 입력)
    await user.type(screen.getByLabelText(/능력 이름/), "테스트 능력");
    await user.type(screen.getByLabelText(/능력 설명/), "테스트 설명입니다");
    await user.type(screen.getByLabelText(/제약 사항/), "제약이 있다");
    await user.click(screen.getByLabelText("Will"));
    await user.click(screen.getByRole("button", { name: /다음/ }));

    // Step 4: 프로필 입력 (필수 필드 입력)
    await user.type(screen.getByLabelText(/캐릭터 이름/), "카이");
    await user.type(screen.getByLabelText(/나이/), "25");
    await user.click(screen.getByRole("button", { name: /다음/ }));

    // Step 5: 확인
    expect(screen.getByText("5 / 5")).toBeInTheDocument();
    expect(screen.getByText("카이")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /제출/ })).toBeInTheDocument();
  });
});
