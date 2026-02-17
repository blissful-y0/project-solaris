import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TopBar } from "../TopBar";

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
});
