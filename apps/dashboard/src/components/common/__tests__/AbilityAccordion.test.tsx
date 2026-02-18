import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import type { Ability } from "../AbilityAccordion";
import { AbilityAccordion } from "../AbilityAccordion";

const mockAbilities: Ability[] = [
  {
    tier: "basic",
    name: "역장 전개",
    description: "주변에 방어 역장을 전개한다.",
    weakness: "지속시간이 짧다.",
    costAmount: 5,
    costType: "will",
  },
  {
    tier: "mid",
    name: "역장 폭발",
    description: "역장을 폭발시켜 주변에 피해를 준다.",
    weakness: "자신도 피해를 입는다.",
    costAmount: 15,
    costType: "hp",
  },
  {
    tier: "advanced",
    name: "절대 역장",
    description: "무적의 역장을 전개한다.",
    weakness: "WILL 소모가 극심하다.",
    costAmount: 30,
    costType: "will",
  },
];

const dualCostAbility: Ability[] = [
  {
    tier: "advanced",
    name: "하모닉스 프로토콜",
    description: "이중 자원 소모 스킬",
    weakness: "회복 부담",
    costHp: 10,
    costWill: 30,
  },
];

describe("AbilityAccordion", () => {
  it("3개 능력 이름을 모두 렌더링한다", () => {
    render(<AbilityAccordion abilities={mockAbilities} />);
    expect(screen.getByText("역장 전개")).toBeInTheDocument();
    expect(screen.getByText("역장 폭발")).toBeInTheDocument();
    expect(screen.getByText("절대 역장")).toBeInTheDocument();
  });

  it("tier 한글 매핑: basic→기본기, mid→중급기, advanced→상급기", () => {
    render(<AbilityAccordion abilities={mockAbilities} />);
    expect(screen.getByText("기본기")).toBeInTheDocument();
    expect(screen.getByText("중급기")).toBeInTheDocument();
    expect(screen.getByText("상급기")).toBeInTheDocument();
  });

  it("초기 상태: description이 보이지 않는다", () => {
    render(<AbilityAccordion abilities={mockAbilities} />);
    expect(
      screen.queryByText("주변에 방어 역장을 전개한다."),
    ).not.toBeInTheDocument();
  });

  it("클릭 시 해당 능력의 description을 표시한다", async () => {
    const user = userEvent.setup();
    render(<AbilityAccordion abilities={mockAbilities} />);

    await user.click(screen.getByText("역장 전개"));
    expect(
      screen.getByText("주변에 방어 역장을 전개한다."),
    ).toBeInTheDocument();
  });

  it("클릭 시 weakness를 표시한다", async () => {
    const user = userEvent.setup();
    render(<AbilityAccordion abilities={mockAbilities} />);

    await user.click(screen.getByText("역장 전개"));
    expect(screen.getByText("지속시간이 짧다.")).toBeInTheDocument();
  });

  it("클릭 시 cost를 표시한다 (WILL 5)", async () => {
    const user = userEvent.setup();
    render(<AbilityAccordion abilities={mockAbilities} />);

    await user.click(screen.getByText("역장 전개"));
    expect(screen.getByText("WILL 5")).toBeInTheDocument();
  });

  it("클릭 시 cost를 표시한다 (HP 15)", async () => {
    const user = userEvent.setup();
    render(<AbilityAccordion abilities={mockAbilities} />);

    await user.click(screen.getByText("역장 폭발"));
    expect(screen.getByText("HP 15")).toBeInTheDocument();
  });

  it("클릭 시 HP/WILL 이중 코스트를 함께 표시한다", async () => {
    const user = userEvent.setup();
    render(<AbilityAccordion abilities={dualCostAbility} />);

    await user.click(screen.getByText("하모닉스 프로토콜"));
    expect(screen.getByText("HP 10 + WILL 30")).toBeInTheDocument();
  });

  it("다시 클릭하면 접힌다", async () => {
    const user = userEvent.setup();
    render(<AbilityAccordion abilities={mockAbilities} />);

    await user.click(screen.getByText("역장 전개"));
    expect(
      screen.getByText("주변에 방어 역장을 전개한다."),
    ).toBeInTheDocument();

    await user.click(screen.getByText("역장 전개"));
    expect(
      screen.queryByText("주변에 방어 역장을 전개한다."),
    ).not.toBeInTheDocument();
  });

  it("토글 버튼은 aria-expanded 상태를 제공한다", async () => {
    const user = userEvent.setup();
    render(<AbilityAccordion abilities={mockAbilities} />);

    const trigger = screen.getByRole("button", { name: /역장 전개/ });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("빈 배열 → 빈 상태 메시지", () => {
    render(<AbilityAccordion abilities={[]} />);
    expect(screen.getByText("등록된 능력이 없습니다")).toBeInTheDocument();
  });

  it("className prop을 병합한다", () => {
    const { container } = render(
      <AbilityAccordion abilities={mockAbilities} className="mt-6" />,
    );
    expect(container.firstElementChild).toHaveClass("mt-6");
  });
});
