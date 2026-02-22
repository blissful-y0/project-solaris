import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { BriefingCard } from "../BriefingCard";
import type { Briefing } from "../mock-briefings";

/* date-fns 한국어 상대시간을 안정적으로 테스트하기 위해 모킹 */
vi.mock("date-fns", async () => {
  const actual = await vi.importActual<typeof import("date-fns")>("date-fns");
  return {
    ...actual,
    formatDistanceToNow: () => "2시간 전",
  };
});

const baseBriefing: Briefing = {
  id: "b1",
  bulletinNumber: "BULLETIN_047",
  timestamp: new Date().toISOString(),
  category: "전투",
  title: "구역 7-B 교전 보고",
  content: "Enforcer 소속 능력자 2명과 Static 잔존 세력 간 교전 발생.",
  source: "HELIOS COMBAT SYSTEM",
};

describe("BriefingCard", () => {
  it("제목을 렌더링한다", () => {
    render(<BriefingCard briefing={baseBriefing} />);
    expect(screen.getByText("구역 7-B 교전 보고")).toBeInTheDocument();
  });

  it("본문을 렌더링한다", () => {
    render(<BriefingCard briefing={baseBriefing} />);
    expect(
      screen.getByText("Enforcer 소속 능력자 2명과 Static 잔존 세력 간 교전 발생."),
    ).toBeInTheDocument();
  });

  it("소스를 렌더링한다", () => {
    render(<BriefingCard briefing={baseBriefing} />);
    expect(screen.getByText("HELIOS COMBAT SYSTEM")).toBeInTheDocument();
  });

  it("BULLETIN 번호를 표시한다", () => {
    render(<BriefingCard briefing={baseBriefing} />);
    expect(screen.getByText("BULLETIN_047")).toBeInTheDocument();
  });

  it("카테고리 Badge를 표시한다", () => {
    render(<BriefingCard briefing={baseBriefing} />);
    expect(screen.getByText("전투")).toBeInTheDocument();
  });

  it("상대 시간을 표시한다", () => {
    render(<BriefingCard briefing={baseBriefing} />);
    expect(screen.getByText("2시간 전")).toBeInTheDocument();
  });

  it("정보 카테고리일 때 info variant를 사용한다", () => {
    const infoBriefing: Briefing = { ...baseBriefing, category: "정보" };
    render(<BriefingCard briefing={infoBriefing} />);
    const badge = screen.getByText("정보");
    expect(badge).toHaveClass("text-primary");
  });

  it("시스템 카테고리일 때 success variant를 사용한다", () => {
    const sysBriefing: Briefing = { ...baseBriefing, category: "시스템" };
    render(<BriefingCard briefing={sysBriefing} />);
    const badge = screen.getByText("시스템");
    expect(badge).toHaveClass("text-success");
  });

  it("키보드 Enter 입력으로 onClick을 호출한다", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<BriefingCard briefing={baseBriefing} onClick={onClick} />);

    const card = screen.getByRole("button", { name: /구역 7-B 교전 보고/ });
    card.focus();
    await user.keyboard("{Enter}");

    expect(onClick).toHaveBeenCalledOnce();
  });
});
