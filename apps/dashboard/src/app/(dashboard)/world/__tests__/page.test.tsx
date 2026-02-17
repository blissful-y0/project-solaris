import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import WorldPage from "../page";

describe("WorldPage", () => {
  it("세계관 핵심 섹션을 렌더링한다", () => {
    render(<WorldPage />);

    expect(screen.getByText("LORE")).toBeInTheDocument();
    expect(screen.getByText("도시: 솔라리스")).toBeInTheDocument();
    expect(screen.getByText("진영 구도")).toBeInTheDocument();
    expect(screen.getByText("능력 체계")).toBeInTheDocument();
    expect(screen.getByText("일상과 통제")).toBeInTheDocument();
  });

  it("캐릭터 생성 CTA를 제공한다", () => {
    render(<WorldPage />);

    const cta = screen.getByRole("link", { name: "캐릭터 생성하러 가기" });
    expect(cta).toHaveAttribute("href", "/character/create");
  });
});
