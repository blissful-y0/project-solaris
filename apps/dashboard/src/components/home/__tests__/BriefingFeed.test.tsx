import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { BriefingFeed } from "../BriefingFeed";
import type { Briefing } from "../mock-briefings";

vi.mock("date-fns", async () => {
  const actual = await vi.importActual<typeof import("date-fns")>("date-fns");
  return {
    ...actual,
    formatDistanceToNow: () => "2시간 전",
  };
});

const briefings: Briefing[] = [
  {
    id: "b1",
    bulletinNumber: "BULLETIN_047",
    timestamp: "2026-02-17T10:00:00Z",
    category: "전투",
    title: "구역 7-B 교전 보고",
    content: "교전 발생.",
    source: "HELIOS COMBAT SYSTEM",
  },
  {
    id: "b2",
    bulletinNumber: "BULLETIN_048",
    timestamp: "2026-02-17T08:00:00Z",
    category: "정보",
    title: "세력 동향 감청 결과",
    content: "감청 결과 보고.",
    source: "HELIOS INTELLIGENCE",
  },
  {
    id: "b3",
    bulletinNumber: "BULLETIN_049",
    timestamp: "2026-02-17T06:00:00Z",
    category: "시스템",
    title: "HELIOS 시스템 점검",
    content: "정기 점검 완료.",
    source: "HELIOS CORE",
  },
];

describe("BriefingFeed", () => {
  it("HELIOS INTELLIGENCE FEED 헤더를 표시한다", () => {
    render(<BriefingFeed briefings={briefings} />);
    expect(screen.getByText("HELIOS INTELLIGENCE FEED")).toBeInTheDocument();
  });

  it("수신된 정보 목록 서브헤더를 표시한다", () => {
    render(<BriefingFeed briefings={briefings} />);
    expect(screen.getByText("수신된 정보 목록")).toBeInTheDocument();
  });

  it("모든 브리핑 카드를 렌더링한다", () => {
    render(<BriefingFeed briefings={briefings} />);
    expect(screen.getByText("구역 7-B 교전 보고")).toBeInTheDocument();
    expect(screen.getByText("세력 동향 감청 결과")).toBeInTheDocument();
    expect(screen.getByText("HELIOS 시스템 점검")).toBeInTheDocument();
  });

  it("3개 브리핑 후 PomiAd를 삽입한다", () => {
    render(<BriefingFeed briefings={briefings} />);
    expect(screen.getByText("POMI WELLNESS")).toBeInTheDocument();
  });

  it("빈 배열일 때 빈 상태를 처리한다", () => {
    render(<BriefingFeed briefings={[]} />);
    expect(screen.getByText("HELIOS INTELLIGENCE FEED")).toBeInTheDocument();
    expect(screen.getByText("수신된 브리핑이 없습니다")).toBeInTheDocument();
  });
});
