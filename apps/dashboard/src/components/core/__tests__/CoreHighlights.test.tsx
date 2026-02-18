import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CoreHighlights } from "../CoreHighlights";
import { BATTLE_HIGHLIGHTS } from "../mock-core-data";

describe("CoreHighlights", () => {
  it("COMBAT HIGHLIGHTS 헤더를 렌더링한다", () => {
    render(<CoreHighlights items={BATTLE_HIGHLIGHTS} />);
    expect(screen.getByText("COMBAT HIGHLIGHTS")).toBeInTheDocument();
  });

  it("모든 참가자 정보를 렌더링한다", () => {
    render(<CoreHighlights items={BATTLE_HIGHLIGHTS} />);
    for (const item of BATTLE_HIGHLIGHTS) {
      expect(screen.getByText(item.participants)).toBeInTheDocument();
    }
  });

  it("각 항목의 결과를 표시한다", () => {
    render(<CoreHighlights items={BATTLE_HIGHLIGHTS} />);
    expect(screen.getByText("아마츠키 레이 승리")).toBeInTheDocument();
  });

  it("GM 요약을 1줄로 표시한다", () => {
    render(<CoreHighlights items={BATTLE_HIGHLIGHTS} />);
    expect(screen.getByText(BATTLE_HIGHLIGHTS[0].gmSummary)).toBeInTheDocument();
  });

  it("날짜를 표시한다", () => {
    render(<CoreHighlights items={BATTLE_HIGHLIGHTS} />);
    expect(screen.getByText("02.18")).toBeInTheDocument();
  });

  it("빈 배열일 때 빈 상태를 표시한다", () => {
    render(<CoreHighlights items={[]} />);
    expect(screen.getByText("기록된 전투가 없습니다.")).toBeInTheDocument();
  });

  it("3건의 항목이 모두 렌더링된다", () => {
    const { container } = render(<CoreHighlights items={BATTLE_HIGHLIGHTS} />);
    const articles = container.querySelectorAll("article");
    expect(articles.length).toBe(3);
  });

  it("Card hud 스타일로 감싼다", () => {
    const { container } = render(<CoreHighlights items={BATTLE_HIGHLIGHTS} />);
    const card = container.querySelector(".hud-corners");
    expect(card).toBeInTheDocument();
  });
});
