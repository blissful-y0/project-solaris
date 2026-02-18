import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { LorePageClient } from "../LorePageClient";
import type { LoreCategoryContent } from "../types";

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
const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => new URLSearchParams(),
}));

const mockContents: LoreCategoryContent[] = [
  { id: "overview", html: "<p>세계 개요 내용</p>" },
  { id: "society", html: "<p>사회 구조 내용</p>" },
  { id: "resonance", html: "<p>공명율 내용</p>" },
  { id: "abilities", html: "<p>능력 분류 내용</p>" },
  { id: "factions", html: "<p>대립 구도 내용</p>" },
  { id: "battle-rules", html: "<p>배틀룰 내용</p>" },
];

describe("LorePageClient", () => {
  it("페이지 타이틀을 렌더링한다", () => {
    render(<LorePageClient contents={mockContents} />);
    expect(screen.getByText("솔라리스 세계관 아카이브")).toBeInTheDocument();
  });

  it("LORE // CLASSIFIED ARCHIVE 라벨을 표시한다", () => {
    render(<LorePageClient contents={mockContents} />);
    expect(screen.getByText("LORE // CLASSIFIED ARCHIVE")).toBeInTheDocument();
  });

  it("초기 상태에서 '개요' 카테고리 콘텐츠를 표시한다", () => {
    render(<LorePageClient contents={mockContents} />);
    expect(screen.getByText("세계 개요 내용")).toBeInTheDocument();
  });

  it("카테고리 클릭 시 해당 콘텐츠로 전환한다", async () => {
    const user = userEvent.setup();
    render(<LorePageClient contents={mockContents} />);

    await user.click(screen.getByText("사회구조"));
    expect(screen.getByText("사회 구조 내용")).toBeInTheDocument();
    expect(screen.queryByText("세계 개요 내용")).not.toBeInTheDocument();
  });

  it("카테고리 클릭 시 URL을 업데이트한다", async () => {
    const user = userEvent.setup();
    render(<LorePageClient contents={mockContents} />);

    await user.click(screen.getByText("대립구도"));
    expect(mockReplace).toHaveBeenCalledWith("/lore?category=factions", {
      scroll: false,
    });
  });

  it("카테고리 네비게이션을 렌더링한다", () => {
    render(<LorePageClient contents={mockContents} />);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("하단 CTA를 렌더링한다", () => {
    render(<LorePageClient contents={mockContents} />);
    expect(screen.getByText("NEW OPERATIVE")).toBeInTheDocument();
  });

  it("검열 블록 안내 텍스트를 포함한다", () => {
    render(<LorePageClient contents={mockContents} />);
    expect(screen.getByText("열람이 제한됩니다.", { exact: false })).toBeInTheDocument();
    expect(screen.getByLabelText("검열된 정보")).toBeInTheDocument();
  });

  it("initialCategory prop으로 초기 카테고리를 설정한다", () => {
    render(
      <LorePageClient contents={mockContents} initialCategory="factions" />,
    );
    expect(screen.getByText("대립 구도 내용")).toBeInTheDocument();
  });
});
