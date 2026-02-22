import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CharacterFilterChips } from "../CharacterFilterChips";

describe("CharacterFilterChips", () => {
  it("소속 필터 칩을 렌더링한다", () => {
    render(
      <CharacterFilterChips
        factionFilter="all"
        abilityFilter="all"
        onFactionChange={() => {}}
        onAbilityChange={() => {}}
      />,
    );
    expect(screen.getByText("전체")).toBeInTheDocument();
    expect(screen.getByText("Enforcer")).toBeInTheDocument();
    expect(screen.getByText("Static")).toBeInTheDocument();
    /* 전향자 제거됨 — bureau/static만 표시 */
  });

  it("소속 칩 클릭 시 onFactionChange를 호출한다", async () => {
    const user = userEvent.setup();
    const onFactionChange = vi.fn();
    render(
      <CharacterFilterChips
        factionFilter="all"
        abilityFilter="all"
        onFactionChange={onFactionChange}
        onAbilityChange={() => {}}
      />,
    );

    await user.click(screen.getByText("Enforcer"));
    expect(onFactionChange).toHaveBeenCalledWith("bureau");
  });

  it("소속이 '전체'가 아닐 때 능력 계열 서브필터를 표시한다", () => {
    render(
      <CharacterFilterChips
        factionFilter="bureau"
        abilityFilter="all"
        onFactionChange={() => {}}
        onAbilityChange={() => {}}
      />,
    );
    expect(screen.getByText("역장")).toBeInTheDocument();
    expect(screen.getByText("감응")).toBeInTheDocument();
    expect(screen.getByText("변환")).toBeInTheDocument();
    expect(screen.getByText("연산")).toBeInTheDocument();
  });

  it("소속이 '전체'이면 능력 서브필터를 숨긴다", () => {
    render(
      <CharacterFilterChips
        factionFilter="all"
        abilityFilter="all"
        onFactionChange={() => {}}
        onAbilityChange={() => {}}
      />,
    );
    expect(screen.queryByText("역장")).not.toBeInTheDocument();
  });

  it("소속이 'static'이면 능력 서브필터를 표시한다", () => {
    render(
      <CharacterFilterChips
        factionFilter="static"
        abilityFilter="all"
        onFactionChange={() => {}}
        onAbilityChange={() => {}}
      />,
    );
    expect(screen.getByText("역장")).toBeInTheDocument();
  });

  it("능력 칩 클릭 시 onAbilityChange를 호출한다", async () => {
    const user = userEvent.setup();
    const onAbilityChange = vi.fn();
    render(
      <CharacterFilterChips
        factionFilter="bureau"
        abilityFilter="all"
        onFactionChange={() => {}}
        onAbilityChange={onAbilityChange}
      />,
    );

    await user.click(screen.getByText("역장"));
    expect(onAbilityChange).toHaveBeenCalledWith("field");
  });
});
