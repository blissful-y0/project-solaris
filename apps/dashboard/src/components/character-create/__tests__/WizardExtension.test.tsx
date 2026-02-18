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
  skills: {
    basic: { name: "공간 압축", description: "소형 물체 이동", costHp: "0", costWill: "5" },
    mid: { name: "단거리 도약", description: "중형 물체 이동", costHp: "0", costWill: "15" },
    advanced: { name: "차원 왜곡", description: "공간 자체를 왜곡", costHp: "0", costWill: "40" },
  },
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

  it("각 스킬 티어에 코스트 입력 필드를 렌더링한다", () => {
    const { container } = render(<StepAbilityDesign draft={BASE_DRAFT} onChange={vi.fn()} />);
    // Bureau이므로 WILL 소모 필드가 각 티어에 표시됨
    expect(container.querySelector("#skill-basic-will")).toBeInTheDocument();
    expect(container.querySelector("#skill-mid-will")).toBeInTheDocument();
    expect(container.querySelector("#skill-advanced-will")).toBeInTheDocument();
  });

  it("코스트 입력 시 onChange를 호출한다 (skills 구조 업데이트)", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<StepAbilityDesign draft={BASE_DRAFT} onChange={onChange} />);

    const willInput = container.querySelector("#skill-basic-will") as HTMLInputElement;
    await user.type(willInput, "10");
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[0][0]).toHaveProperty("skills");
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
    expect(screen.getByText(/승인 시 진영을 대표하는 리더로 지정됩니다/)).toBeInTheDocument();
  });

  it("약점 요약을 표시한다", () => {
    const draftWithWeakness = {
      ...BASE_DRAFT,
      abilityWeakness: "근접전 취약",
    };
    render(<StepConfirm {...defaultProps} draft={draftWithWeakness} />);
    expect(screen.getByText("근접전 취약")).toBeInTheDocument();
  });

  it("스킬 코스트를 요약에 표시한다", () => {
    render(<StepConfirm {...defaultProps} />);
    // Bureau draft의 기본 스킬: costWill="5" → "WILL 5" 형식으로 표시됨
    expect(screen.getByText("WILL 5")).toBeInTheDocument();
    expect(screen.getByText("WILL 15")).toBeInTheDocument();
    expect(screen.getByText("WILL 40")).toBeInTheDocument();
  });
});
