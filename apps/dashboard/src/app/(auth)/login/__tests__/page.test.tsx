import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import LoginPage from "../page";

describe("LoginPage", () => {
  it("renders SOLARIS title", () => {
    render(<LoginPage />);
    expect(screen.getByText("SOLARIS")).toBeInTheDocument();
  });

  it("shows SYSTEM ACCESS TERMINAL identifier", () => {
    render(<LoginPage />);
    expect(screen.getByText("SYSTEM ACCESS TERMINAL")).toBeInTheDocument();
  });

  it("shows OPERATOR AUTHENTICATION subtitle", () => {
    render(<LoginPage />);
    expect(screen.getByText("OPERATOR AUTHENTICATION")).toBeInTheDocument();
  });

  it("renders Discord login button with correct text", () => {
    render(<LoginPage />);
    expect(
      screen.getByRole("button", { name: /Discord로 로그인/i }),
    ).toBeInTheDocument();
  });

  it("Discord button calls onClick handler when clicked", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const user = userEvent.setup();

    render(<LoginPage />);
    await user.click(
      screen.getByRole("button", { name: /Discord로 로그인/i }),
    );

    expect(consoleSpy).toHaveBeenCalledWith("Discord login clicked");
    consoleSpy.mockRestore();
  });

  it("shows system status indicator", () => {
    render(<LoginPage />);
    expect(screen.getByText(/SYSTEM STATUS/i)).toBeInTheDocument();
    expect(screen.getByText(/ONLINE/i)).toBeInTheDocument();
  });

  it("has accessible button role for Discord login", () => {
    render(<LoginPage />);
    const button = screen.getByRole("button", { name: /Discord로 로그인/i });
    expect(button).toBeEnabled();
  });

  it("card has HUD corner styling", () => {
    render(<LoginPage />);
    const card = screen.getByTestId("login-card");
    expect(card.className).toMatch(/hud-corners/);
  });
});
