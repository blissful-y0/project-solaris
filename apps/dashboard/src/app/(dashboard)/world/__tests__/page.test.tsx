import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import WorldPage from "../page";

describe("WorldPage (Lore)", () => {
  it("renders LORE DATABASE HUD label", () => {
    render(<WorldPage />);
    expect(screen.getByText("LORE DATABASE")).toBeInTheDocument();
  });

  it("renders lore section cards", () => {
    render(<WorldPage />);
    const articles = screen.getAllByRole("article");
    expect(articles.length).toBeGreaterThanOrEqual(4);
  });

  it("shows section status indicators", () => {
    render(<WorldPage />);
    expect(screen.getAllByText("열람 가능").length).toBeGreaterThanOrEqual(1);
  });

  it("has main heading", () => {
    render(<WorldPage />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });
});
