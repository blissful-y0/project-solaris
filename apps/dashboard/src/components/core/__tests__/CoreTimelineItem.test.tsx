import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CoreTimelineItem } from "../CoreTimelineItem";
import type { TimelineEntry } from "../mock-core-data";

const critical: TimelineEntry = {
  id: "tl-1",
  timestamp: "2026-02-18 22:14",
  title: "제3구역 검문 강화",
  summary: "남서 외곽 경계선에서 비인가 공명 반응 감지.",
  severity: "critical",
};

const alert: TimelineEntry = {
  id: "tl-2",
  timestamp: "2026-02-18 21:46",
  title: "센서 클러스터 이상",
  summary: "센서 신뢰도 하락, 수동 보정 필요.",
  severity: "alert",
};

const info: TimelineEntry = {
  id: "tl-3",
  timestamp: "2026-02-18 18:00",
  title: "정기 진단 완료",
  summary: "코어 연산 유닛 전체 가동률 98.2%.",
  severity: "info",
};

describe("CoreTimelineItem", () => {
  it("타임스탬프를 모노스페이스로 렌더링한다", () => {
    render(<CoreTimelineItem entry={critical} />);
    const ts = screen.getByText("2026-02-18 22:14");
    expect(ts).toHaveClass("font-mono");
  });

  it("제목을 볼드로 렌더링한다", () => {
    render(<CoreTimelineItem entry={critical} />);
    const title = screen.getByText("제3구역 검문 강화");
    expect(title).toHaveClass("font-semibold");
  });

  it("요약을 line-clamp-2로 렌더링한다", () => {
    render(<CoreTimelineItem entry={critical} />);
    const summary = screen.getByText(critical.summary);
    expect(summary).toHaveClass("line-clamp-2");
  });

  it("critical severity → danger Badge 표시", () => {
    render(<CoreTimelineItem entry={critical} />);
    const badge = screen.getByText("CRITICAL");
    expect(badge).toHaveClass("text-accent");
  });

  it("alert severity → warning Badge 표시", () => {
    render(<CoreTimelineItem entry={alert} />);
    const badge = screen.getByText("ALERT");
    expect(badge).toHaveClass("text-warning");
  });

  it("info severity → default Badge 표시", () => {
    render(<CoreTimelineItem entry={info} />);
    const badge = screen.getByText("INFO");
    expect(badge).toHaveClass("text-text-secondary");
  });

  it("좌측 타임라인 도트를 렌더링한다", () => {
    const { container } = render(<CoreTimelineItem entry={critical} />);
    const dot = container.querySelector("[data-testid='timeline-dot']");
    expect(dot).toBeInTheDocument();
  });

  it("article 요소로 감싼다", () => {
    const { container } = render(<CoreTimelineItem entry={critical} />);
    expect(container.querySelector("article")).toBeInTheDocument();
  });
});
