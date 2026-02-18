import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LoreContent } from "../LoreContent";

describe("LoreContent", () => {
  it("HTML 콘텐츠를 렌더링한다", () => {
    render(<LoreContent html="<p>솔라리스 세계관</p>" />);
    expect(screen.getByText("솔라리스 세계관")).toBeInTheDocument();
  });

  it("article 역할로 렌더링한다", () => {
    render(<LoreContent html="<p>테스트</p>" />);
    expect(screen.getByRole("article")).toBeInTheDocument();
  });

  it("className prop을 병합한다", () => {
    render(<LoreContent html="<p>테스트</p>" className="mt-8" />);
    expect(screen.getByRole("article")).toHaveClass("mt-8");
  });

  it("빈 HTML일 때 빈 상태 메시지를 표시한다", () => {
    render(<LoreContent html="" />);
    expect(
      screen.getByText("콘텐츠를 불러올 수 없습니다"),
    ).toBeInTheDocument();
  });

  it("h2 태그를 렌더링한다", () => {
    render(<LoreContent html="<h2>헬리오스 시스템</h2><p>내용</p>" />);
    expect(
      screen.getByRole("heading", { name: "헬리오스 시스템" }),
    ).toBeInTheDocument();
  });
});
