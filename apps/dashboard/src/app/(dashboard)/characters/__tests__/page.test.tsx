import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CharactersPage from "../page";

describe("CharactersPage (REGISTRY)", () => {
  it("renders REGISTRY HUD label", () => {
    render(<CharactersPage />);
    expect(screen.getByText("REGISTRY")).toBeInTheDocument();
  });

  it("renders mock character cards", () => {
    render(<CharactersPage />);
    const articles = screen.getAllByRole("article");
    expect(articles.length).toBeGreaterThanOrEqual(4);
  });

  it("shows faction badges", () => {
    render(<CharactersPage />);
    expect(screen.getAllByText("SBCS").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("STATIC").length).toBeGreaterThanOrEqual(1);
  });

  it("shows character names", () => {
    render(<CharactersPage />);
    expect(screen.getByText("카이 안데르센")).toBeInTheDocument();
    expect(screen.getByText("레이 노바크")).toBeInTheDocument();
  });
});
