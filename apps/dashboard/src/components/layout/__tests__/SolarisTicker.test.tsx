import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SolarisTicker } from "../SolarisTicker";

describe("SolarisTicker", () => {
  it("티커 엔트리를 렌더링한다", () => {
    render(<SolarisTicker />);

    expect(screen.getByText("HELIOS ALERT")).toBeInTheDocument();
    expect(screen.getAllByText(/헬리오스 코어 정기 점검 완료/).length).toBeGreaterThan(0);
  });

  it("TopBar 아래 고정 배치를 사용한다", () => {
    render(<SolarisTicker />);

    const ticker = screen.getByTestId("solaris-ticker");
    expect(ticker.className).toMatch(/fixed/);
    expect(ticker.className).toMatch(/top-14/);
  });
});
