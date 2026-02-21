import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MobileTabBar } from "../MobileTabBar";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("MobileTabBar", () => {
  it("renders all 5 navigation items", () => {
    render(<MobileTabBar currentPath="/" />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Helios Core")).toBeInTheDocument();
    expect(screen.getByText("Operation")).toBeInTheDocument();
    expect(screen.getByText("Registry")).toBeInTheDocument();
    expect(screen.getByText("Lore")).toBeInTheDocument();
  });

  it("highlights active item based on currentPath", () => {
    render(<MobileTabBar currentPath="/operation" isCharacterApproved />);
    const operationLink = screen.getByRole("link", { name: /operation/i });
    expect(operationLink).toHaveClass("text-primary");
  });

  it("does not highlight inactive items", () => {
    render(<MobileTabBar currentPath="/operation" isCharacterApproved />);
    const homeLink = screen.getByRole("link", { name: /home/i });
    expect(homeLink).not.toHaveClass("text-primary");
  });

  it("활성 탭에 aria-current=page를 설정한다", () => {
    render(<MobileTabBar currentPath="/operation" isCharacterApproved />);
    const operationLink = screen.getByRole("link", { name: /operation/i });
    const homeLink = screen.getByRole("link", { name: /home/i });

    expect(operationLink).toHaveAttribute("aria-current", "page");
    expect(homeLink).not.toHaveAttribute("aria-current");
  });

  it("has navigation role", () => {
    render(<MobileTabBar currentPath="/" />);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("each item has accessible label via link text", () => {
    render(<MobileTabBar currentPath="/" isCharacterApproved />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(5);
  });

  it("has md:hidden class for desktop hiding", () => {
    const { container } = render(<MobileTabBar currentPath="/" />);
    const nav = container.querySelector("nav");
    expect(nav?.className).toContain("md:hidden");
  });

  it("links to correct routes", () => {
    render(<MobileTabBar currentPath="/" isCharacterApproved />);
    expect(screen.getByRole("link", { name: /home/i })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: /helios core/i })).toHaveAttribute("href", "/core");
    expect(screen.getByRole("link", { name: /operation/i })).toHaveAttribute("href", "/operation");
    expect(screen.getByRole("link", { name: /registry/i })).toHaveAttribute("href", "/registry");
    expect(screen.getByRole("link", { name: /lore/i })).toHaveAttribute("href", "/lore");
  });

  // --- 잠금 UI 테스트 ---

  it("Operation은 항상 정상 Link로 렌더링한다", () => {
    render(<MobileTabBar currentPath="/" />);
    const operationLink = screen.getByRole("link", { name: /operation/i });
    expect(operationLink).toHaveAttribute("href", "/operation");
  });

  it("Operation에 Lock 아이콘 없음", () => {
    render(<MobileTabBar currentPath="/" />);
    expect(screen.queryByTestId("lock-icon-/operation")).not.toBeInTheDocument();
  });
});
