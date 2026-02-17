import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CorePage from "../page";

describe("CorePage (Helios Core)", () => {
  it("renders HELIOS CORE HUD label", () => {
    render(<CorePage />);
    expect(screen.getByText("HELIOS CORE")).toBeInTheDocument();
  });

  it("renders timeline entries", () => {
    render(<CorePage />);
    const articles = screen.getAllByRole("article");
    expect(articles.length).toBeGreaterThanOrEqual(3);
  });

  it("shows ARC EVENT badges", () => {
    render(<CorePage />);
    expect(screen.getAllByText("ARC EVENT").length).toBeGreaterThanOrEqual(1);
  });

  it("has main heading", () => {
    render(<CorePage />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });
});
