import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Card } from "../Card";

describe("Card", () => {
  it("renders children", () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText("Card content")).toBeInTheDocument();
  });

  it("has default variant styles", () => {
    render(<Card data-testid="card">Content</Card>);
    const card = screen.getByTestId("card");
    expect(card).toHaveClass("bg-bg-secondary/80", "border", "border-border", "rounded-lg", "p-4");
  });

  it("interactive variant adds hover classes and cursor-pointer", () => {
    render(
      <Card variant="interactive" data-testid="card">
        Interactive
      </Card>,
    );
    const card = screen.getByTestId("card");
    expect(card).toHaveClass("cursor-pointer");
    expect(card).toHaveClass("hover:border-primary/30");
  });

  it("hud corners class applied when hud=true", () => {
    render(
      <Card hud data-testid="card">
        HUD
      </Card>,
    );
    expect(screen.getByTestId("card")).toHaveClass("hud-corners");
  });

  it("does not have hud-corners when hud is false", () => {
    render(<Card data-testid="card">No HUD</Card>);
    expect(screen.getByTestId("card")).not.toHaveClass("hud-corners");
  });

  it("forwards onClick handler", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Card onClick={onClick} data-testid="card">
        Clickable
      </Card>,
    );
    await user.click(screen.getByTestId("card"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("forwards className", () => {
    render(
      <Card className="extra-class" data-testid="card">
        Styled
      </Card>,
    );
    expect(screen.getByTestId("card")).toHaveClass("extra-class");
  });

  it("has backdrop blur", () => {
    render(<Card data-testid="card">Content</Card>);
    expect(screen.getByTestId("card")).toHaveClass("backdrop-blur-sm");
  });
});
