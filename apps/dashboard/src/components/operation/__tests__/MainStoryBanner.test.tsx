import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MainStoryBanner } from "../MainStoryBanner";
import type { OperationItem } from "../types";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mainStory: OperationItem = {
  id: "op-main-001",
  title: "시즌 1 — 심층 구역 이상 징후",
  type: "operation",
  status: "live",
  teamA: [
    { id: "ch-001", name: "카이 안데르센" },
    { id: "ch-002", name: "아마츠키 레이" },
  ],
  teamB: [
    { id: "ch-003", name: "나디아 볼코프" },
    { id: "ch-004", name: "시온 파크" },
  ],
  host: { id: "admin-001", name: "HELIOS" },
  summary: "HELIOS 최우선 작전 지시. 심층 구역 비정상 공명 감지. 전 요원 소집.",
  maxParticipants: 12,
  createdAt: "2026-02-15T09:00:00Z",
  isMainStory: true,
};

describe("MainStoryBanner", () => {
  it("이벤트 데이터가 null이면 렌더링하지 않는다", () => {
    const { container } = render(<MainStoryBanner event={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("MAIN STORY // ACTIVE 라벨을 표시한다", () => {
    render(<MainStoryBanner event={mainStory} />);
    expect(screen.getByText(/MAIN STORY/)).toBeInTheDocument();
    expect(screen.getByText(/ACTIVE/)).toBeInTheDocument();
  });

  it("이벤트 제목을 표시한다", () => {
    render(<MainStoryBanner event={mainStory} />);
    expect(screen.getByText("시즌 1 — 심층 구역 이상 징후")).toBeInTheDocument();
  });

  it("이벤트 설명을 표시한다", () => {
    render(<MainStoryBanner event={mainStory} />);
    expect(screen.getByText(/HELIOS 최우선 작전 지시/)).toBeInTheDocument();
  });

  it("참가자 수를 표시한다", () => {
    render(<MainStoryBanner event={mainStory} />);
    /* teamA(2) + teamB(2) = 4명 / maxParticipants 12 */
    expect(screen.getByText(/참가자 4\/12/)).toBeInTheDocument();
  });

  it("개설일을 표시한다", () => {
    render(<MainStoryBanner event={mainStory} />);
    expect(screen.getByText(/2026\.02\.15 개설/)).toBeInTheDocument();
  });

  it("'관전'과 '입장 ▸' 버튼을 표시한다", () => {
    render(<MainStoryBanner event={mainStory} />);
    expect(screen.getByText("관전")).toBeInTheDocument();
    expect(screen.getByText("입장 ▸")).toBeInTheDocument();
  });

  it("hud-corners 클래스를 적용한다", () => {
    render(<MainStoryBanner event={mainStory} />);
    const banner = screen.getByTestId("main-story-banner");
    expect(banner).toHaveClass("hud-corners");
  });
});
