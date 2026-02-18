import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LorePageClient } from "@/components/lore";
import type { LoreCategoryContent } from "@/components/lore";

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

/* next/navigation 모킹 */
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

const mockContents: LoreCategoryContent[] = [
  { id: "overview", html: "<h2>세계 개요</h2><p>2174년 솔라리스</p>" },
  { id: "society", html: "<p>사회 구조 내용</p>" },
  { id: "resonance", html: "<p>공명율 내용</p>" },
  { id: "abilities", html: "<p>능력 분류 내용</p>" },
  { id: "factions", html: "<p>대립 구도 내용</p>" },
  { id: "battle-rules", html: "<p>배틀룰 내용</p>" },
];

describe("WorldPage (LorePageClient)", () => {
  it("LORE // CLASSIFIED ARCHIVE 라벨과 페이지 타이틀을 렌더링한다", () => {
    render(<LorePageClient contents={mockContents} />);
    expect(
      screen.getByText("LORE // CLASSIFIED ARCHIVE"),
    ).toBeInTheDocument();
    expect(screen.getByText("솔라리스 세계관 아카이브")).toBeInTheDocument();
  });

  it("6개 카테고리 칩을 모두 표시한다", () => {
    render(<LorePageClient contents={mockContents} />);
    expect(screen.getByText("개요")).toBeInTheDocument();
    expect(screen.getByText("사회구조")).toBeInTheDocument();
    expect(screen.getByText("공명율과 능력체계")).toBeInTheDocument();
    expect(screen.getByText("능력분류")).toBeInTheDocument();
    expect(screen.getByText("대립구도")).toBeInTheDocument();
    expect(screen.getByText("배틀룰")).toBeInTheDocument();
  });

  it("캐릭터 생성 CTA를 제공한다", () => {
    render(<LorePageClient contents={mockContents} />);
    const cta = screen.getByRole("link", { name: "캐릭터 생성하러 가기" });
    expect(cta).toHaveAttribute("href", "/character/create");
  });

  it("초기 상태에서 개요 콘텐츠를 표시한다", () => {
    render(<LorePageClient contents={mockContents} />);
    expect(screen.getByText("2174년 솔라리스")).toBeInTheDocument();
  });
});
