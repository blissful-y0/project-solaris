import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge } from "../Badge";

describe("Badge", () => {
  it("renders text content", () => {
    render(<Badge>Online</Badge>);
    expect(screen.getByText("Online")).toBeInTheDocument();
  });

  it("renders default variant", () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText("Default");
    expect(badge).toHaveClass("text-text-secondary");
  });

  it("renders success variant", () => {
    render(<Badge variant="success">Active</Badge>);
    const badge = screen.getByText("Active");
    expect(badge).toHaveClass("text-success");
  });

  it("renders warning variant", () => {
    render(<Badge variant="warning">Pending</Badge>);
    const badge = screen.getByText("Pending");
    expect(badge).toHaveClass("text-warning");
  });

  it("renders danger variant", () => {
    render(<Badge variant="danger">Error</Badge>);
    const badge = screen.getByText("Error");
    expect(badge).toHaveClass("text-accent");
  });

  it("renders info variant", () => {
    render(<Badge variant="info">Info</Badge>);
    const badge = screen.getByText("Info");
    expect(badge).toHaveClass("text-primary");
  });

  it("renders sm size", () => {
    render(<Badge size="sm">Small</Badge>);
    const badge = screen.getByText("Small");
    expect(badge).toHaveClass("px-2", "py-0.5");
  });

  it("renders md size", () => {
    render(<Badge size="md">Medium</Badge>);
    const badge = screen.getByText("Medium");
    expect(badge).toHaveClass("px-2.5", "py-1", "text-xs");
  });

  it("forwards className", () => {
    render(<Badge className="custom-badge">Styled</Badge>);
    expect(screen.getByText("Styled")).toHaveClass("custom-badge");
  });

  it("has common badge styles", () => {
    render(<Badge>Test</Badge>);
    const badge = screen.getByText("Test");
    expect(badge).toHaveClass("inline-flex", "items-center", "rounded-full", "font-medium", "uppercase");
  });
});
