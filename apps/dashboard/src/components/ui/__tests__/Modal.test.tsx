import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Modal } from "../Modal";

describe("Modal", () => {
  it("does not render when open=false", () => {
    render(
      <Modal open={false} onClose={() => {}}>
        Hidden content
      </Modal>,
    );
    expect(screen.queryByText("Hidden content")).not.toBeInTheDocument();
  });

  it("renders content when open=true", () => {
    render(
      <Modal open onClose={() => {}}>
        Visible content
      </Modal>,
    );
    expect(screen.getByText("Visible content")).toBeInTheDocument();
  });

  it("calls onClose when ESC pressed", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose}>
        Content
      </Modal>,
    );
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when overlay clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose}>
        Content
      </Modal>,
    );
    const overlay = screen.getByTestId("modal-overlay");
    await user.click(overlay);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("does not close when content area clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose}>
        <button>Inner button</button>
      </Modal>,
    );
    await user.click(screen.getByText("Inner button"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("shows title when provided", () => {
    render(
      <Modal open onClose={() => {}} title="Modal Title">
        Content
      </Modal>,
    );
    expect(screen.getByText("Modal Title")).toBeInTheDocument();
  });

  it("has correct aria attributes", () => {
    render(
      <Modal open onClose={() => {}}>
        Content
      </Modal>,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("renders children", () => {
    render(
      <Modal open onClose={() => {}}>
        <div data-testid="child">Child element</div>
      </Modal>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("has close button", () => {
    render(
      <Modal open onClose={() => {}}>
        Content
      </Modal>,
    );
    expect(screen.getByLabelText("닫기")).toBeInTheDocument();
  });

  it("calls onClose when close button clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose}>
        Content
      </Modal>,
    );
    await user.click(screen.getByLabelText("닫기"));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
