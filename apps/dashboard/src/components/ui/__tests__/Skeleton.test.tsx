import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Skeleton } from "../Skeleton";

describe("Skeleton", () => {
  it("renders with line variant by default", () => {
    render(<Skeleton data-testid="skeleton" />);
    const el = screen.getByTestId("skeleton");
    expect(el).toHaveClass("h-4", "w-full", "rounded");
  });

  it("renders circle variant", () => {
    render(<Skeleton variant="circle" width="40px" height="40px" data-testid="skeleton" />);
    const el = screen.getByTestId("skeleton");
    expect(el).toHaveClass("rounded-full");
    expect(el).toHaveStyle({ width: "40px", height: "40px" });
  });

  it("renders card variant", () => {
    render(<Skeleton variant="card" data-testid="skeleton" />);
    const el = screen.getByTestId("skeleton");
    expect(el).toHaveClass("h-32", "w-full", "rounded-lg");
  });

  it("applies custom className", () => {
    render(<Skeleton className="custom-skeleton" data-testid="skeleton" />);
    expect(screen.getByTestId("skeleton")).toHaveClass("custom-skeleton");
  });

  it("applies custom width and height", () => {
    render(<Skeleton width="200px" height="20px" data-testid="skeleton" />);
    const el = screen.getByTestId("skeleton");
    expect(el).toHaveStyle({ width: "200px", height: "20px" });
  });

  it("has animation class", () => {
    render(<Skeleton data-testid="skeleton" />);
    const el = screen.getByTestId("skeleton");
    expect(el.className).toContain("animate-");
  });

  it("has base skeleton styles", () => {
    render(<Skeleton data-testid="skeleton" />);
    const el = screen.getByTestId("skeleton");
    expect(el).toHaveClass("bg-subtle/40");
  });
});
