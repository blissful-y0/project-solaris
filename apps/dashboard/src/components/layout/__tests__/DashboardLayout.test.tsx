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

  it("renders SolarisTicker", () => {
    render(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>,
    );
    expect(screen.getByTestId("solaris-ticker")).toBeInTheDocument();
  });

  it("renders MobileTabBar", () => {
    render(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>,
    );
    const allHome = screen.getAllByText("Home");
    expect(allHome.length).toBeGreaterThanOrEqual(1);
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

  it("isCharacterApproved를 MobileTabBar/TopBar에 전달한다", () => {
    render(
      <DashboardLayout isCharacterApproved={false}>
        <div>Content</div>
      </DashboardLayout>,
    );
    // isCharacterApproved=false → Operation 잠금 (Lock 아이콘 표시)
    // MobileTabBar + TopBar 양쪽에 Lock 아이콘이 렌더링됨
    const lockIcons = screen.getAllByTestId("lock-icon-/operation");
    expect(lockIcons.length).toBe(2);
  });

  it("isCharacterApproved=true → Operation 잠금 해제", () => {
    render(
      <DashboardLayout isCharacterApproved>
        <div>Content</div>
      </DashboardLayout>,
    );
    const lockIcons = screen.queryAllByTestId("lock-icon-/operation");
    expect(lockIcons.length).toBe(0);
  });
});
