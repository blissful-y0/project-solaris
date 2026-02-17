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
  it("renders all 5 navigation items with IA v2 labels", () => {
    render(<DesktopSidebar currentPath="/" />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Lore")).toBeInTheDocument();
    expect(screen.getByText("Operation")).toBeInTheDocument();
    expect(screen.getByText("REGISTRY")).toBeInTheDocument();
    expect(screen.getByText("Helios Core")).toBeInTheDocument();
  });

  it("highlights active item based on currentPath", () => {
    render(<DesktopSidebar currentPath="/characters" />);
    const activeLink = screen.getByRole("link", { name: /registry/i });
    expect(activeLink).toHaveClass("text-primary");
  });

  it("does not highlight inactive items", () => {
    render(<DesktopSidebar currentPath="/characters" />);
    const homeLink = screen.getByRole("link", { name: /home/i });
    expect(homeLink).not.toHaveClass("text-primary");
  });

  it("활성 메뉴에 aria-current=page를 설정한다", () => {
    render(<DesktopSidebar currentPath="/characters" />);
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
    render(<DesktopSidebar currentPath="/" />);
    expect(screen.getByRole("link", { name: /home/i })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: /lore/i })).toHaveAttribute("href", "/world");
    expect(screen.getByRole("link", { name: /operation/i })).toHaveAttribute("href", "/operation");
    expect(screen.getByRole("link", { name: /registry/i })).toHaveAttribute("href", "/characters");
    expect(screen.getByRole("link", { name: /helios core/i })).toHaveAttribute("href", "/core");
  });
});
