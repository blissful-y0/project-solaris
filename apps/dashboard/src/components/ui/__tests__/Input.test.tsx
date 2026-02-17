import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Input } from "../Input";

describe("Input", () => {
  it("renders input element", () => {
    render(<Input />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("shows label when provided", () => {
    render(<Input label="Username" />);
    expect(screen.getByText("Username")).toBeInTheDocument();
  });

  it("shows error message", () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText("This field is required")).toBeInTheDocument();
  });

  it("shows helper text", () => {
    render(<Input helperText="Enter your email" />);
    expect(screen.getByText("Enter your email")).toBeInTheDocument();
  });

  it("renders with icon", () => {
    render(<Input icon={<span data-testid="icon">@</span>} />);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("error state overrides helper text display", () => {
    render(<Input error="Error!" helperText="Help text" />);
    expect(screen.getByText("Error!")).toBeInTheDocument();
    expect(screen.queryByText("Help text")).not.toBeInTheDocument();
  });

  it("forwards native input props", () => {
    render(<Input placeholder="Type here..." type="email" disabled />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("placeholder", "Type here...");
    expect(input).toBeDisabled();
  });

  it("has accessible label association", () => {
    render(<Input label="Email" id="email-field" />);
    const input = screen.getByLabelText("Email");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("id", "email-field");
  });

  it("auto-generates id for label association when not provided", () => {
    render(<Input label="Password" />);
    const input = screen.getByLabelText("Password");
    expect(input).toBeInTheDocument();
  });

  it("applies error styles to input", () => {
    render(<Input error="Invalid" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("border-accent/50");
  });

  it("forwards className to wrapper", () => {
    render(<Input className="custom-class" />);
    const wrapper = screen.getByRole("textbox").closest("div")?.parentElement;
    expect(wrapper).toHaveClass("custom-class");
  });

  it("accepts user input", async () => {
    const user = userEvent.setup();
    render(<Input />);
    const input = screen.getByRole("textbox");
    await user.type(input, "hello");
    expect(input).toHaveValue("hello");
  });
});
