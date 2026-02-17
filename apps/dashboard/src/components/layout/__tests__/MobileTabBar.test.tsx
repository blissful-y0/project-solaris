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
  it("renders all 5 navigation items with IA v2 labels", () => {
    render(<MobileTabBar currentPath="/" />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Lore")).toBeInTheDocument();
    expect(screen.getByText("Operation")).toBeInTheDocument();
    expect(screen.getByText("REGISTRY")).toBeInTheDocument();
    expect(screen.getByText("Helios Core")).toBeInTheDocument();
  });

  it("highlights active item based on currentPath", () => {
    render(<MobileTabBar currentPath="/operation" />);
    const operationLink = screen.getByRole("link", { name: /operation/i });
    expect(operationLink).toHaveClass("text-primary");
  });

  it("does not highlight inactive items", () => {
    render(<MobileTabBar currentPath="/operation" />);
    const homeLink = screen.getByRole("link", { name: /home/i });
    expect(homeLink).not.toHaveClass("text-primary");
  });

  it("활성 탭에 aria-current=page를 설정한다", () => {
    render(<MobileTabBar currentPath="/operation" />);
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
    render(<MobileTabBar currentPath="/" />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(5);
  });

  it("has md:hidden class for desktop hiding", () => {
    const { container } = render(<MobileTabBar currentPath="/" />);
    const nav = container.querySelector("nav");
    expect(nav?.className).toContain("md:hidden");
  });

  it("links to correct routes", () => {
    render(<MobileTabBar currentPath="/" />);
    expect(screen.getByRole("link", { name: /home/i })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: /lore/i })).toHaveAttribute("href", "/world");
    expect(screen.getByRole("link", { name: /operation/i })).toHaveAttribute("href", "/operation");
    expect(screen.getByRole("link", { name: /registry/i })).toHaveAttribute("href", "/characters");
    expect(screen.getByRole("link", { name: /helios core/i })).toHaveAttribute("href", "/core");
  });
});
