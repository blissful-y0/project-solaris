import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CorePage from "../page";

describe("CorePage (Helios Core)", () => {
  it("renders HELIOS CORE HUD label", () => {
    render(<CorePage />);
    expect(screen.getByText("HELIOS CORE")).toBeInTheDocument();
  });

  it("renders placeholder message", () => {
    render(<CorePage />);
    expect(screen.getByText(/ARC 사건 발생 시스템/i)).toBeInTheDocument();
  });

  it("has main heading", () => {
    render(<CorePage />);
    expect(screen.getByRole("heading")).toBeInTheDocument();
  });
});
