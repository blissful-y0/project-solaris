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
  it("renders all 4 navigation items with IA v2 labels", () => {
    render(<MobileTabBar currentPath="/" />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Operation")).toBeInTheDocument();
    expect(screen.getByText("Registry")).toBeInTheDocument();
    expect(screen.getByText("Helios Core")).toBeInTheDocument();
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
    expect(links).toHaveLength(4);
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
  });

  // --- 잠금 UI 테스트 ---

  it("isCharacterApproved=false → Operation에 Lock 아이콘 표시", () => {
    render(<MobileTabBar currentPath="/" isCharacterApproved={false} />);
    // Operation은 requireApproval: true → 잠금 상태
    const lockIcon = screen.getByTestId("lock-icon-/operation");
    expect(lockIcon).toBeInTheDocument();
  });

  it("isCharacterApproved=false → Operation이 button으로 렌더링 (Link 아님)", () => {
    render(<MobileTabBar currentPath="/" isCharacterApproved={false} />);
    const operationButton = screen.getByRole("button", { name: /operation/i });
    expect(operationButton).toBeInTheDocument();
    expect(operationButton).toHaveAttribute("aria-disabled", "true");
  });

  it("isCharacterApproved=false → Operation 텍스트에 흐린 스타일", () => {
    render(<MobileTabBar currentPath="/" isCharacterApproved={false} />);
    const operationButton = screen.getByRole("button", { name: /operation/i });
    expect(operationButton.className).toContain("text-text-secondary/40");
  });

  it("isCharacterApproved=true → Operation에 정상 Link 렌더링", () => {
    render(<MobileTabBar currentPath="/" isCharacterApproved />);
    const operationLink = screen.getByRole("link", { name: /operation/i });
    expect(operationLink).toHaveAttribute("href", "/operation");
  });

  it("isCharacterApproved=true → Lock 아이콘 없음", () => {
    render(<MobileTabBar currentPath="/" isCharacterApproved />);
    const lockIcon = screen.queryByTestId("lock-icon-/operation");
    expect(lockIcon).not.toBeInTheDocument();
  });

  it("isCharacterApproved 미전달(기본값) → requireApproval 항목 잠금", () => {
    render(<MobileTabBar currentPath="/" />);
    // 기본값 false → Operation 잠금
    const lockIcon = screen.getByTestId("lock-icon-/operation");
    expect(lockIcon).toBeInTheDocument();
  });

  it("requireApproval 없는 항목은 잠금 영향 없음", () => {
    render(<MobileTabBar currentPath="/" isCharacterApproved={false} />);
    // Home은 requireApproval 없음 → 정상 Link
    const homeLink = screen.getByRole("link", { name: /home/i });
    expect(homeLink).toHaveAttribute("href", "/");
  });
});
