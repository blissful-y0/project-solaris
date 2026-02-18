import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StatBar } from "../StatBar";

describe("StatBar", () => {
  it("current/max 텍스트를 표시한다", () => {
    render(<StatBar current={80} max={100} variant="hp" />);
    expect(screen.getByText("80/100")).toBeInTheDocument();
  });

  it("label을 표시한다", () => {
    render(<StatBar current={80} max={100} variant="hp" label="HP" />);
    expect(screen.getByText("HP")).toBeInTheDocument();
  });

  it("aria-valuenow 접근성 속성을 가진다", () => {
    render(<StatBar current={80} max={100} variant="hp" label="HP" />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "80");
  });

  it("aria-valuemax 접근성 속성을 가진다", () => {
    render(<StatBar current={80} max={100} variant="hp" label="HP" />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });

  it("80% 너비의 바를 렌더링한다", () => {
    render(<StatBar current={80} max={100} variant="hp" />);
    const bar = screen.getByRole("progressbar");
    const fill = bar.firstElementChild as HTMLElement;
    expect(fill.style.width).toBe("80%");
  });

  it("current=0 → 0% 너비", () => {
    render(<StatBar current={0} max={100} variant="hp" />);
    const bar = screen.getByRole("progressbar");
    const fill = bar.firstElementChild as HTMLElement;
    expect(fill.style.width).toBe("0%");
  });

  it("current > max → 100%로 클램프", () => {
    render(<StatBar current={150} max={100} variant="hp" />);
    const bar = screen.getByRole("progressbar");
    const fill = bar.firstElementChild as HTMLElement;
    expect(fill.style.width).toBe("100%");
  });

  it("max=0이면 NaN 없이 0%로 처리한다", () => {
    render(<StatBar current={10} max={0} variant="hp" />);
    const bar = screen.getByRole("progressbar");
    const fill = bar.firstElementChild as HTMLElement;
    expect(fill.style.width).toBe("0%");
  });

  it("variant='hp' → success→accent 그라데이션", () => {
    render(<StatBar current={50} max={100} variant="hp" />);
    const bar = screen.getByRole("progressbar");
    const fill = bar.firstElementChild as HTMLElement;
    expect(fill).toHaveClass("from-success", "to-accent");
  });

  it("variant='will' → primary→violet 그라데이션", () => {
    render(<StatBar current={50} max={100} variant="will" />);
    const bar = screen.getByRole("progressbar");
    const fill = bar.firstElementChild as HTMLElement;
    expect(fill).toHaveClass("from-primary", "to-violet-500");
  });

  it("className prop을 병합한다", () => {
    render(
      <StatBar current={50} max={100} variant="hp" className="mt-4" />,
    );
    const container = screen.getByRole("progressbar").parentElement;
    expect(container).toHaveClass("mt-4");
  });
});
