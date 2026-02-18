import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CoreTimeline } from "../CoreTimeline";
import { CORE_TIMELINE } from "../mock-core-data";

describe("CoreTimeline", () => {
  it("모든 항목의 제목을 렌더링한다", () => {
    render(<CoreTimeline items={CORE_TIMELINE} />);
    for (const item of CORE_TIMELINE) {
      expect(screen.getByText(item.title)).toBeInTheDocument();
    }
  });

  it("severity 뱃지를 표시한다", () => {
    render(<CoreTimeline items={CORE_TIMELINE} />);
    expect(screen.getByText("CRITICAL")).toBeInTheDocument();
    expect(screen.getAllByText("ALERT").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("INFO").length).toBeGreaterThanOrEqual(1);
  });

  it("좌측 타임라인 세로선(border-l)을 가진다", () => {
    const { container } = render(<CoreTimeline items={CORE_TIMELINE} />);
    const line = container.querySelector("[data-testid='timeline-line']");
    expect(line).toBeInTheDocument();
  });

  it("빈 배열일 때 빈 상태를 표시한다", () => {
    render(<CoreTimeline items={[]} />);
    expect(screen.getByText("등록된 브리핑이 없습니다.")).toBeInTheDocument();
  });

  it("7건의 항목이 모두 렌더링된다", () => {
    const { container } = render(<CoreTimeline items={CORE_TIMELINE} />);
    const articles = container.querySelectorAll("article");
    expect(articles.length).toBe(7);
  });

  it("Card hud 스타일로 감싼다", () => {
    const { container } = render(<CoreTimeline items={CORE_TIMELINE} />);
    const card = container.querySelector(".hud-corners");
    expect(card).toBeInTheDocument();
  });
});
