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
    expect(screen.getByText("홈")).toBeInTheDocument();
    expect(screen.getByText("전투")).toBeInTheDocument();
    expect(screen.getByText("RP")).toBeInTheDocument();
    expect(screen.getByText("도감")).toBeInTheDocument();
    expect(screen.getByText("MY")).toBeInTheDocument();
  });

  it("highlights active item based on currentPath", () => {
    render(<MobileTabBar currentPath="/battle" />);
    const battleLink = screen.getByRole("link", { name: /전투/i });
    expect(battleLink).toHaveClass("text-primary");
  });

  it("does not highlight inactive items", () => {
    render(<MobileTabBar currentPath="/battle" />);
    const homeLink = screen.getByRole("link", { name: /홈/i });
    expect(homeLink).not.toHaveClass("text-primary");
  });

  it("has navigation role", () => {
    render(<MobileTabBar currentPath="/" />);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("each item has accessible label via link text", () => {
    render(<MobileTabBar currentPath="/" />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(5);
  });

  it("has md:hidden class for desktop hiding", () => {
    const { container } = render(<MobileTabBar currentPath="/" />);
    const nav = container.querySelector("nav");
    expect(nav?.className).toContain("md:hidden");
  });
});
