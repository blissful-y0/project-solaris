import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DashboardLayout } from "../DashboardLayout";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("DashboardLayout", () => {
  it("renders children in main content area", () => {
    render(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>,
    );
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("renders TopBar", () => {
    render(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>,
    );
    expect(screen.getByText("SOLARIS")).toBeInTheDocument();
  });

  it("renders MobileTabBar", () => {
    render(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>,
    );
    // MobileTabBar renders nav items — check for one
    const allHome = screen.getAllByText("Home");
    expect(allHome.length).toBeGreaterThanOrEqual(1);
  });

  it("renders DesktopSidebar", () => {
    render(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>,
    );
    expect(screen.getByText("SOLARIS TERMINAL")).toBeInTheDocument();
  });

  it("has main landmark role for content area", () => {
    render(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>,
    );
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("passes notificationCount to TopBar", () => {
    render(
      <DashboardLayout notificationCount={5}>
        <div>Content</div>
      </DashboardLayout>,
    );
    expect(screen.getByText("5")).toBeInTheDocument();
  });
});
