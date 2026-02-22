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

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("../DashboardSessionProvider", () => ({
  useDashboardSession: () => ({
    me: {
      user: { id: "u1", email: "a@b.com", displayName: "Test", discordUsername: null },
      character: null,
    },
    loading: false,
    error: null,
    refetch: vi.fn(),
  }),
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
    expect(screen.getByRole("banner")).toBeInTheDocument();
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

  it("isCharacterApproved=false여도 Operation은 정상 Link로 렌더링한다", () => {
    render(
      <DashboardLayout isCharacterApproved={false}>
        <div>Content</div>
      </DashboardLayout>,
    );
    const operationLinks = screen.getAllByRole("link", { name: /operation/i });
    expect(operationLinks.length).toBeGreaterThanOrEqual(1);
    operationLinks.forEach((link) => {
      expect(link).toHaveAttribute("href", "/operation");
    });
    expect(screen.queryByTestId("lock-icon-/operation")).not.toBeInTheDocument();
  });

  it("isCharacterApproved=true → Operation 잠금 없음", () => {
    render(
      <DashboardLayout isCharacterApproved>
        <div>Content</div>
      </DashboardLayout>,
    );
    const lockIcons = screen.queryAllByTestId("lock-icon-/operation");
    expect(lockIcons.length).toBe(0);
  });

  it("renders DashboardFooter", () => {
    render(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>,
    );
    const footer = screen.getByRole("contentinfo");
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveTextContent(/RUNNING ON HELIOS CORE/);
  });
});
