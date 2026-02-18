import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LoreCTA } from "../LoreCTA";

/* next/link 모킹 */
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("LoreCTA", () => {
  it("캐릭터 생성 링크를 표시한다", () => {
    render(<LoreCTA />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/character/create");
  });

  it("NEW OPERATIVE 라벨을 표시한다", () => {
    render(<LoreCTA />);
    expect(screen.getByText("NEW OPERATIVE")).toBeInTheDocument();
  });

  it("유도 문구를 표시한다", () => {
    render(<LoreCTA />);
    expect(
      screen.getByText(/세계관.*이해.*마쳤다면|오퍼레이터.*등록/),
    ).toBeInTheDocument();
  });

  it("className prop을 병합한다", () => {
    const { container } = render(<LoreCTA className="mt-12" />);
    expect(container.firstElementChild).toHaveClass("mt-12");
  });
});
