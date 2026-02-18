import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProgressBar } from "../ProgressBar";

describe("ProgressBar", () => {
  it("value=50, max=100 → 50% 너비 inner bar", () => {
    render(<ProgressBar value={50} max={100} />);
    const bar = screen.getByRole("progressbar");
    const inner = bar.firstElementChild as HTMLElement;
    expect(inner.style.width).toBe("50%");
  });

  it("value=0 → 0% 너비", () => {
    render(<ProgressBar value={0} max={100} />);
    const bar = screen.getByRole("progressbar");
    const inner = bar.firstElementChild as HTMLElement;
    expect(inner.style.width).toBe("0%");
  });

  it("value > max → 100%로 클램프", () => {
    render(<ProgressBar value={150} max={100} />);
    const bar = screen.getByRole("progressbar");
    const inner = bar.firstElementChild as HTMLElement;
    expect(inner.style.width).toBe("100%");
  });

  it("variant='cyan' → 시안 색상 클래스", () => {
    render(<ProgressBar value={50} max={100} variant="cyan" />);
    const bar = screen.getByRole("progressbar");
    const inner = bar.firstElementChild as HTMLElement;
    expect(inner.className).toContain("bg-primary");
  });

  it("variant='red' → 레드 색상 클래스", () => {
    render(<ProgressBar value={50} max={100} variant="red" />);
    const bar = screen.getByRole("progressbar");
    const inner = bar.firstElementChild as HTMLElement;
    expect(inner.className).toContain("bg-accent");
  });

  it("variant='default' → 기본 색상 클래스", () => {
    render(<ProgressBar value={50} max={100} variant="default" />);
    const bar = screen.getByRole("progressbar");
    const inner = bar.firstElementChild as HTMLElement;
    expect(inner.className).toContain("bg-text-secondary");
  });

  it("variant 미지정 → 기본 색상", () => {
    render(<ProgressBar value={50} max={100} />);
    const bar = screen.getByRole("progressbar");
    const inner = bar.firstElementChild as HTMLElement;
    expect(inner.className).toContain("bg-text-secondary");
  });

  it("label 텍스트를 표시한다", () => {
    render(<ProgressBar value={30} max={100} label="HP" />);
    expect(screen.getByText("HP")).toBeInTheDocument();
  });

  it("label 없으면 라벨 텍스트가 없다", () => {
    const { container } = render(<ProgressBar value={30} max={100} />);
    const label = container.querySelector("[data-testid='progress-label']");
    expect(label).toBeNull();
  });

  it("aria-valuenow 속성을 가진다", () => {
    render(<ProgressBar value={75} max={100} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "75");
  });

  it("aria-valuemax 속성을 가진다", () => {
    render(<ProgressBar value={75} max={100} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });

  it("aria-valuemin=0 속성을 가진다", () => {
    render(<ProgressBar value={75} max={100} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
  });

  it("className을 전달할 수 있다", () => {
    const { container } = render(
      <ProgressBar value={50} max={100} className="custom-bar" />,
    );
    expect(container.firstElementChild?.className).toContain("custom-bar");
  });
});
