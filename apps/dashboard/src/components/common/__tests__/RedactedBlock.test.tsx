import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RedactedBlock } from "../RedactedBlock";

describe("RedactedBlock", () => {
  it("children 텍스트를 렌더링한다", () => {
    render(<RedactedBlock>기밀 정보</RedactedBlock>);
    expect(screen.getByText("기밀 정보")).toBeInTheDocument();
  });

  it("텍스트를 시각적으로 숨긴다 (text-transparent)", () => {
    render(<RedactedBlock>기밀 정보</RedactedBlock>);
    const el = screen.getByText("기밀 정보");
    expect(el).toHaveClass("text-transparent");
  });

  it("select-none 클래스를 적용한다", () => {
    render(<RedactedBlock>기밀 정보</RedactedBlock>);
    const el = screen.getByText("기밀 정보");
    expect(el).toHaveClass("select-none");
  });

  it("접근성 라벨을 가진다", () => {
    render(<RedactedBlock>기밀 정보</RedactedBlock>);
    expect(screen.getByLabelText("검열된 정보")).toBeInTheDocument();
  });

  it("className prop을 병합한다", () => {
    render(<RedactedBlock className="mt-4">기밀 정보</RedactedBlock>);
    const el = screen.getByLabelText("검열된 정보");
    expect(el).toHaveClass("mt-4");
  });

  it("hover 시 CLASSIFIED 툴팁을 가진다", () => {
    render(<RedactedBlock>기밀 정보</RedactedBlock>);
    const el = screen.getByLabelText("검열된 정보");
    expect(el).toHaveAttribute("title", "CLASSIFIED");
  });

  it("bg-current 클래스로 배경을 덮는다", () => {
    render(<RedactedBlock>기밀 정보</RedactedBlock>);
    const el = screen.getByText("기밀 정보");
    expect(el).toHaveClass("bg-current");
  });
});
