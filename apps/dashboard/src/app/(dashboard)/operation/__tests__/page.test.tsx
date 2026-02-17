import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import OperationPage from "../page";

describe("OperationPage", () => {
  it("renders OPERATION HUD label", () => {
    render(<OperationPage />);
    expect(screen.getByText("OPERATION")).toBeInTheDocument();
  });

  it("renders unified operation list", () => {
    render(<OperationPage />);
    const rooms = screen.getAllByRole("article");
    expect(rooms.length).toBeGreaterThanOrEqual(3);
  });

  it("shows both battle and RP entries", () => {
    render(<OperationPage />);
    expect(screen.getAllByText("전투").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("RP").length).toBeGreaterThanOrEqual(1);
  });
});
