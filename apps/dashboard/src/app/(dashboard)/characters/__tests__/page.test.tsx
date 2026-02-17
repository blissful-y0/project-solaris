import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CharactersPage from "../page";

describe("CharactersPage (REGISTRY)", () => {
  it("renders REGISTRY HUD label", () => {
    render(<CharactersPage />);
    expect(screen.getByText("REGISTRY")).toBeInTheDocument();
  });

  it("renders placeholder message", () => {
    render(<CharactersPage />);
    expect(screen.getByText(/캐릭터/i)).toBeInTheDocument();
  });

  it("renders mock character cards", () => {
    render(<CharactersPage />);
    const cards = screen.getAllByRole("article");
    expect(cards.length).toBeGreaterThanOrEqual(1);
  });
});
