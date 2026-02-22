import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CoreSystemStatus } from "../CoreSystemStatus";
import { SYSTEM_STATUS } from "../mock-core-data";

describe("CoreSystemStatus", () => {
  it("HELIOS SYSTEM STATUS 헤더를 렌더링한다", () => {
    render(<CoreSystemStatus data={SYSTEM_STATUS} />);
    expect(screen.getByText("HELIOS SYSTEM STATUS")).toBeInTheDocument();
  });

  it("ARC 프로그레스바를 렌더링한다", () => {
    render(<CoreSystemStatus data={SYSTEM_STATUS} />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuenow", "35");
  });

  it("ARC 라벨을 모노스페이스로 표시한다", () => {
    render(<CoreSystemStatus data={SYSTEM_STATUS} />);
    const label = screen.getByText("ARC-01 // 35%");
    expect(label).toHaveClass("font-mono");
  });

  it("도시 공명율 퍼센트를 표시한다", () => {
    render(<CoreSystemStatus data={SYSTEM_STATUS} />);
    expect(screen.getByText("82.4%")).toBeInTheDocument();
  });

  it("CITY RESONANCE RATE 라벨을 표시한다", () => {
    render(<CoreSystemStatus data={SYSTEM_STATUS} />);
    expect(screen.getByText("CITY RESONANCE RATE")).toBeInTheDocument();
  });

  it("활성 작전 수를 표시한다", () => {
    render(<CoreSystemStatus data={SYSTEM_STATUS} />);
    expect(screen.getByText("7")).toBeInTheDocument();
  });

  it("ACTIVE OPERATIONS 라벨을 표시한다", () => {
    render(<CoreSystemStatus data={SYSTEM_STATUS} />);
    expect(screen.getByText("ACTIVE OPERATIONS")).toBeInTheDocument();
  });

  it("Card hud 스타일로 감싼다", () => {
    const { container } = render(<CoreSystemStatus data={SYSTEM_STATUS} />);
    const card = container.querySelector(".hud-corners");
    expect(card).toBeInTheDocument();
  });
});
