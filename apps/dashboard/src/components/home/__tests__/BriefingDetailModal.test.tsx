import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { BriefingDetailModal } from "../BriefingDetailModal";
import type { Briefing } from "../mock-briefings";

vi.mock("date-fns", async () => {
  const actual = await vi.importActual<typeof import("date-fns")>("date-fns");
  return {
    ...actual,
    format: () => "2026.02.17 14:00",
  };
});

const briefing: Briefing = {
  id: "b1",
  bulletinNumber: "BULLETIN_054",
  timestamp: "2026-02-17T14:00:00+09:00",
  category: "전투",
  title: "구역 7-B 다자간 교전 종결",
  content: "테스트 본문",
  source: "HELIOS COMBAT SYSTEM",
};

describe("BriefingDetailModal", () => {
  it("briefing이 null이면 렌더링하지 않는다", () => {
    render(<BriefingDetailModal briefing={null} onClose={() => {}} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("상세 정보를 모달에 렌더링한다", () => {
    render(<BriefingDetailModal briefing={briefing} onClose={() => {}} />);

    expect(screen.getByRole("dialog", { name: "브리핑 상세" })).toBeInTheDocument();
    expect(screen.getByText("BULLETIN_054")).toBeInTheDocument();
    expect(screen.getByText("구역 7-B 다자간 교전 종결")).toBeInTheDocument();
    expect(screen.getByText("테스트 본문")).toBeInTheDocument();
    expect(screen.getByText("2026.02.17 14:00")).toBeInTheDocument();
  });
});
