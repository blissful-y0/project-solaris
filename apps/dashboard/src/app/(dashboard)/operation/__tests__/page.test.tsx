import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import OperationPage from "../page";

describe("OperationPage", () => {
  it("renders OPERATION HUD label", () => {
    render(<OperationPage />);
    expect(screen.getByText("OPERATION")).toBeInTheDocument();
  });

  it("renders operation room list", () => {
    render(<OperationPage />);
    const rooms = screen.getAllByRole("article");
    expect(rooms.length).toBeGreaterThanOrEqual(3);
  });

  it("shows room type badges (전투/RP)", () => {
    render(<OperationPage />);
    expect(screen.getAllByText("전투").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("RP").length).toBeGreaterThanOrEqual(1);
  });

  it("shows participant count for each room", () => {
    render(<OperationPage />);
    const participantLabels = screen.getAllByText(/\d+\/\d+/);
    expect(participantLabels.length).toBeGreaterThanOrEqual(1);
  });

  it("shows room status", () => {
    render(<OperationPage />);
    const statuses = screen.getAllByText(/대기중|진행중/);
    expect(statuses.length).toBeGreaterThanOrEqual(1);
  });
});
