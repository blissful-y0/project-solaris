import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DesktopSidebar } from "../DesktopSidebar";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("DesktopSidebar", () => {
  it("renders all 5 navigation items", () => {
    render(<DesktopSidebar currentPath="/" />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Helios Core")).toBeInTheDocument();
    expect(screen.getByText("Operation")).toBeInTheDocument();
    expect(screen.getByText("Registry")).toBeInTheDocument();
    expect(screen.getByText("Lore")).toBeInTheDocument();
  });

  it("highlights active item based on currentPath", () => {
    render(<DesktopSidebar currentPath="/registry" isCharacterApproved />);
    const activeLink = screen.getByRole("link", { name: /registry/i });
    expect(activeLink).toHaveClass("text-primary");
  });

  it("does not highlight inactive items", () => {
    render(<DesktopSidebar currentPath="/registry" isCharacterApproved />);
    const homeLink = screen.getByRole("link", { name: /home/i });
    expect(homeLink).not.toHaveClass("text-primary");
  });

  it("활성 메뉴에 aria-current=page를 설정한다", () => {
    render(<DesktopSidebar currentPath="/registry" isCharacterApproved />);
    const activeLink = screen.getByRole("link", { name: /registry/i });
    const homeLink = screen.getByRole("link", { name: /home/i });

    expect(activeLink).toHaveAttribute("aria-current", "page");
    expect(homeLink).not.toHaveAttribute("aria-current");
  });

  it("renders logo/title text", () => {
    render(<DesktopSidebar currentPath="/" />);
    expect(screen.getByText("SOLARIS TERMINAL")).toBeInTheDocument();
  });

  it("has navigation role", () => {
    render(<DesktopSidebar currentPath="/" />);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("has hidden md:flex classes for responsive visibility", () => {
    const { container } = render(<DesktopSidebar currentPath="/" />);
    const aside = container.querySelector("aside");
    expect(aside?.className).toContain("hidden");
    expect(aside?.className).toContain("md:flex");
  });

  it("renders system status text", () => {
    render(<DesktopSidebar currentPath="/" />);
    expect(screen.getByText("SYS:ONLINE")).toBeInTheDocument();
  });

  it("links to correct routes", () => {
    render(<DesktopSidebar currentPath="/" isCharacterApproved />);
    expect(screen.getByRole("link", { name: /home/i })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: /helios core/i })).toHaveAttribute("href", "/core");
    expect(screen.getByRole("link", { name: /operation/i })).toHaveAttribute("href", "/operation");
    expect(screen.getByRole("link", { name: /registry/i })).toHaveAttribute("href", "/registry");
    expect(screen.getByRole("link", { name: /lore/i })).toHaveAttribute("href", "/lore");
  });

  // --- 잠금 UI 테스트 ---

  it("isCharacterApproved=false → Operation에 Lock 아이콘 표시", () => {
    render(<DesktopSidebar currentPath="/" isCharacterApproved={false} />);
    const lockIcon = screen.getByTestId("lock-icon-/operation");
    expect(lockIcon).toBeInTheDocument();
  });

  it("isCharacterApproved=false → Operation이 button으로 렌더링", () => {
    render(<DesktopSidebar currentPath="/" isCharacterApproved={false} />);
    const operationButton = screen.getByRole("button", { name: /operation/i });
    expect(operationButton).toBeInTheDocument();
    expect(operationButton).toHaveAttribute("aria-disabled", "true");
    expect(operationButton).toHaveAttribute("aria-label", "Operation (캐릭터 승인 후 이용 가능)");
  });

  it("isCharacterApproved=false → Operation에 흐린 스타일", () => {
    render(<DesktopSidebar currentPath="/" isCharacterApproved={false} />);
    const operationButton = screen.getByRole("button", { name: /operation/i });
    expect(operationButton.className).toContain("text-text-secondary/30");
  });

  it("isCharacterApproved=true → Operation에 정상 Link", () => {
    render(<DesktopSidebar currentPath="/" isCharacterApproved />);
    const operationLink = screen.getByRole("link", { name: /operation/i });
    expect(operationLink).toHaveAttribute("href", "/operation");
  });

  it("isCharacterApproved=true → Lock 아이콘 없음", () => {
    render(<DesktopSidebar currentPath="/" isCharacterApproved />);
    const lockIcon = screen.queryByTestId("lock-icon-/operation");
    expect(lockIcon).not.toBeInTheDocument();
  });

  it("isCharacterApproved 미전달 → requireApproval 항목 잠금", () => {
    render(<DesktopSidebar currentPath="/" />);
    const lockIcon = screen.getByTestId("lock-icon-/operation");
    expect(lockIcon).toBeInTheDocument();
  });
});
