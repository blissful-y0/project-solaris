import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SessionPage from "../page";

describe("SessionPage", () => {
  it("renders SESSION HUB HUD label", () => {
    render(<SessionPage />);
    expect(screen.getByText("SESSION HUB")).toBeInTheDocument();
  });

  it("renders combat mode card", () => {
    render(<SessionPage />);
    expect(screen.getByText("COMBAT MODE")).toBeInTheDocument();
  });

  it("renders RP mode card", () => {
    render(<SessionPage />);
    expect(screen.getByText("RP MODE")).toBeInTheDocument();
  });

  it("renders two mode selection cards", () => {
    render(<SessionPage />);
    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(2);
  });
});
