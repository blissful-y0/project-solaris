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
    costAmount: 5,
    costType: "will",
  },
  {
    tier: "mid",
    name: "역장 폭발",
    description: "역장을 폭발시켜 주변에 피해를 준다.",
    costAmount: 15,
    costType: "hp",
  },
  {
    tier: "advanced",
    name: "절대 역장",
    description: "무적의 역장을 전개한다.",
    costAmount: 30,
    costType: "will",
  },
];

const dualCostAbility: Ability[] = [
  {
    tier: "advanced",
    name: "하모닉스 프로토콜",
    description: "이중 자원 소모 스킬",
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

  it("faction 없으면 기본 스킬/중급 스킬/상급 스킬로 표시한다", () => {
    render(<AbilityAccordion abilities={mockAbilities} />);
    expect(screen.getByText("기본 스킬")).toBeInTheDocument();
    expect(screen.getByText("중급 스킬")).toBeInTheDocument();
    expect(screen.getByText("상급 스킬")).toBeInTheDocument();
  });

  it("Enforcer → 상급 스킬이 '하모닉스 프로토콜'로 표시된다", () => {
    render(<AbilityAccordion abilities={mockAbilities} faction="bureau" />);
    expect(screen.getByText("기본 스킬")).toBeInTheDocument();
    expect(screen.getByText("중급 스킬")).toBeInTheDocument();
    expect(screen.getByText("하모닉스 프로토콜")).toBeInTheDocument();
  });

  it("static → 상급 스킬이 '오버드라이브'로 표시된다", () => {
    render(<AbilityAccordion abilities={mockAbilities} faction="static" />);
    expect(screen.getByText("기본 스킬")).toBeInTheDocument();
    expect(screen.getByText("중급 스킬")).toBeInTheDocument();
    expect(screen.getByText("오버드라이브")).toBeInTheDocument();
  });

  it("defector → 상급 스킬이 '오버드라이브'로 표시된다", () => {
    render(<AbilityAccordion abilities={mockAbilities} faction="defector" />);
    expect(screen.getByText("오버드라이브")).toBeInTheDocument();
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

  it("순서가 뒤섞여도 기본→중급→상급 순으로 렌더링한다", () => {
    const reversed: Ability[] = [
      mockAbilities[2], // advanced
      mockAbilities[0], // basic
      mockAbilities[1], // mid
    ];
    render(<AbilityAccordion abilities={reversed} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons[0]).toHaveTextContent("기본 스킬");
    expect(buttons[1]).toHaveTextContent("중급 스킬");
    expect(buttons[2]).toHaveTextContent("상급 스킬");
  });

  it("className prop을 병합한다", () => {
    const { container } = render(
      <AbilityAccordion abilities={mockAbilities} className="mt-6" />,
    );
    expect(container.firstElementChild).toHaveClass("mt-6");
  });
});
