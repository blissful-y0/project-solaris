import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TopBar } from "../TopBar";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("TopBar", () => {
  it("renders SOLARIS text", () => {
    render(<TopBar />);
    expect(screen.getByText("SOLARIS")).toBeInTheDocument();
  });

  it("shows bell icon button", () => {
    render(<TopBar />);
    expect(screen.getByRole("button", { name: /알림/i })).toBeInTheDocument();
  });

  it("shows notification badge when count > 0", () => {
    render(<TopBar notificationCount={3} />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("hides notification badge when count is 0", () => {
    render(<TopBar notificationCount={0} />);
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("hides notification badge when count is undefined", () => {
    render(<TopBar />);
    const badge = screen.queryByTestId("notification-badge");
    expect(badge).not.toBeInTheDocument();
  });

  it("has header role", () => {
    render(<TopBar />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("renders MY profile link to /my", () => {
    render(<TopBar />);
    const myLink = screen.getByRole("link", { name: /마이페이지/i });
    expect(myLink).toBeInTheDocument();
    expect(myLink).toHaveAttribute("href", "/my");
  });
});
