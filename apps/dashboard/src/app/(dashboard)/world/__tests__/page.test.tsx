import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import WorldPage from "../page";

describe("WorldPage (Lore)", () => {
  it("renders LORE DATABASE HUD label", () => {
    render(<WorldPage />);
    expect(screen.getByText("LORE DATABASE")).toBeInTheDocument();
  });

  it("renders placeholder message", () => {
    render(<WorldPage />);
    expect(screen.getByText(/세계관 데이터베이스를 준비/i)).toBeInTheDocument();
  });

  it("has main heading", () => {
    render(<WorldPage />);
    expect(screen.getByRole("heading")).toBeInTheDocument();
  });
});
