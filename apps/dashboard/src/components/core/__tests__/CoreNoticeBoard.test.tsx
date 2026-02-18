import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CoreNoticeBoard } from "../CoreNoticeBoard";
import { CORE_NOTICES } from "../mock-core-data";

describe("CoreNoticeBoard", () => {
  it("SYSTEM NOTICE 헤더를 렌더링한다", () => {
    render(<CoreNoticeBoard items={CORE_NOTICES} />);
    expect(screen.getByText("SYSTEM NOTICE")).toBeInTheDocument();
  });

  it("모든 공지 제목을 렌더링한다", () => {
    render(<CoreNoticeBoard items={CORE_NOTICES} />);
    for (const item of CORE_NOTICES) {
      expect(screen.getByText(item.title)).toBeInTheDocument();
    }
  });

  it("pinned 항목에 핀 아이콘을 표시한다", () => {
    render(<CoreNoticeBoard items={CORE_NOTICES} />);
    const pinIcons = screen.getAllByTestId("pin-icon");
    // CORE_NOTICES에 pinned=true가 2건
    expect(pinIcons.length).toBe(2);
  });

  it("pinned=false 항목에는 핀 아이콘이 없다", () => {
    const unpinnedOnly = CORE_NOTICES.filter((n) => !n.pinned);
    render(<CoreNoticeBoard items={unpinnedOnly} />);
    const pinIcons = screen.queryAllByTestId("pin-icon");
    expect(pinIcons.length).toBe(0);
  });

  it("각 공지의 날짜를 렌더링한다", () => {
    render(<CoreNoticeBoard items={CORE_NOTICES} />);
    expect(screen.getByText("2026-02-18")).toBeInTheDocument();
  });

  it("빈 배열일 때 빈 상태를 표시한다", () => {
    render(<CoreNoticeBoard items={[]} />);
    expect(screen.getByText("등록된 공지가 없습니다.")).toBeInTheDocument();
  });

  it("Card hud 스타일로 감싼다", () => {
    const { container } = render(<CoreNoticeBoard items={CORE_NOTICES} />);
    const card = container.querySelector(".hud-corners");
    expect(card).toBeInTheDocument();
  });
});
