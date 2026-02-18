import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { LoreCategoryNav } from "../LoreCategoryNav";
import { LORE_CATEGORIES } from "../types";

describe("LoreCategoryNav", () => {
  const defaultProps = {
    activeId: "overview" as const,
    onSelect: vi.fn(),
  };

  it("모든 카테고리 라벨을 렌더링한다", () => {
    render(<LoreCategoryNav {...defaultProps} />);
    for (const cat of LORE_CATEGORIES) {
      expect(screen.getByText(cat.label)).toBeInTheDocument();
    }
  });

  it("활성 카테고리에 aria-pressed=true를 적용한다", () => {
    render(<LoreCategoryNav {...defaultProps} activeId="society" />);
    expect(screen.getByText("사회구조")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("비활성 카테고리에 aria-pressed=false를 적용한다", () => {
    render(<LoreCategoryNav {...defaultProps} activeId="society" />);
    expect(screen.getByText("개요")).toHaveAttribute("aria-pressed", "false");
  });

  it("카테고리 클릭 시 onSelect를 호출한다", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<LoreCategoryNav {...defaultProps} onSelect={onSelect} />);

    await user.click(screen.getByText("대립구도"));
    expect(onSelect).toHaveBeenCalledWith("factions");
  });

  it("nav 역할로 렌더링한다", () => {
    render(<LoreCategoryNav {...defaultProps} />);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("className prop을 병합한다", () => {
    render(<LoreCategoryNav {...defaultProps} className="mt-4" />);
    expect(screen.getByRole("navigation")).toHaveClass("mt-4");
  });
});
