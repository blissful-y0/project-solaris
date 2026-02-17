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
  it("renders all 5 navigation items with labels", () => {
    render(<DesktopSidebar currentPath="/" />);
    expect(screen.getByText("홈")).toBeInTheDocument();
    expect(screen.getByText("전투")).toBeInTheDocument();
    expect(screen.getByText("RP")).toBeInTheDocument();
    expect(screen.getByText("도감")).toBeInTheDocument();
    expect(screen.getByText("MY")).toBeInTheDocument();
  });

  it("highlights active item based on currentPath", () => {
    render(<DesktopSidebar currentPath="/characters" />);
    const activeLink = screen.getByRole("link", { name: /도감/i });
    expect(activeLink).toHaveClass("text-primary");
  });

  it("does not highlight inactive items", () => {
    render(<DesktopSidebar currentPath="/characters" />);
    const homeLink = screen.getByRole("link", { name: /홈/i });
    expect(homeLink).not.toHaveClass("text-primary");
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
});
