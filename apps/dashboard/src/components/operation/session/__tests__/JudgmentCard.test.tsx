import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { JudgmentCard } from "../JudgmentCard";
import type { JudgmentResult } from "../types";

const mockJudgment: JudgmentResult = {
  turn: 2,
  participantResults: [
    { participantId: "p1", participantName: "카이", grade: "success", scores: { narrative: 8, tactical: 9, cost: 7, quality: 8 } },
    { participantId: "p2", participantName: "나디아", grade: "partial", scores: { narrative: 7, tactical: 6, cost: 5, quality: 7 } },
  ],
  statChanges: [
    { participantId: "p1", participantName: "카이", stat: "will", before: 245, after: 233, reason: "코스트" },
    { participantId: "p2", participantName: "나디아", stat: "hp", before: 85, after: 52, reason: "피해" },
  ],
};

describe("JudgmentCard", () => {
  it("HELIOS COMBAT SYSTEM 헤더와 턴 번호를 표시한다", () => {
    render(<JudgmentCard judgment={mockJudgment} />);

    expect(screen.getByText(/HELIOS COMBAT SYSTEM/)).toBeInTheDocument();
    expect(screen.getByText(/TURN 2/)).toBeInTheDocument();
  });

  it("각 참가자의 판정 등급을 표시한다", () => {
    render(<JudgmentCard judgment={mockJudgment} />);

    expect(screen.getByTestId("grade-p1")).toHaveTextContent("SUCCESS");
    expect(screen.getByTestId("grade-p2")).toHaveTextContent("PARTIAL");
  });

  it("참가자별 개별 점수 4개 항목을 표시한다", () => {
    render(<JudgmentCard judgment={mockJudgment} />);

    // 각 참가자 블록에 점수 존재
    const p1Block = screen.getByTestId("participant-judgment-p1");
    expect(p1Block).toHaveTextContent("8/10");
    expect(p1Block).toHaveTextContent("9/10");

    const p2Block = screen.getByTestId("participant-judgment-p2");
    expect(p2Block).toHaveTextContent("5/10");
    expect(p2Block).toHaveTextContent("6/10");
  });

  it("스탯 변동을 올바르게 표시한다", () => {
    render(<JudgmentCard judgment={mockJudgment} />);

    const statChanges = screen.getAllByTestId("stat-change");
    expect(statChanges).toHaveLength(2);

    expect(statChanges[0]).toHaveTextContent("카이");
    expect(statChanges[0]).toHaveTextContent("WILL");
    expect(statChanges[0]).toHaveTextContent("245→233");

    expect(statChanges[1]).toHaveTextContent("나디아");
    expect(statChanges[1]).toHaveTextContent("HP");
    expect(statChanges[1]).toHaveTextContent("85→52");
  });

  it("스탯 변동이 없으면 변동 섹션을 표시하지 않는다", () => {
    const noChanges: JudgmentResult = {
      ...mockJudgment,
      statChanges: [],
    };
    render(<JudgmentCard judgment={noChanges} />);

    expect(screen.queryByTestId("stat-change")).not.toBeInTheDocument();
  });

  it("FAIL 등급도 올바르게 표시한다", () => {
    const failJudgment: JudgmentResult = {
      ...mockJudgment,
      participantResults: [
        { participantId: "p1", participantName: "카이", grade: "fail", scores: { narrative: 4, tactical: 3, cost: 5, quality: 4 } },
        { participantId: "p2", participantName: "나디아", grade: "success", scores: { narrative: 9, tactical: 8, cost: 8, quality: 9 } },
      ],
    };
    render(<JudgmentCard judgment={failJudgment} />);

    expect(screen.getByTestId("grade-p1")).toHaveTextContent("FAIL");
    expect(screen.getByTestId("grade-p2")).toHaveTextContent("SUCCESS");
  });

  it("서사는 JudgmentCard 내부에 표시하지 않는다", () => {
    render(<JudgmentCard judgment={mockJudgment} />);

    // 서사 섹션이 없어야 함
    expect(screen.queryByText("서사")).not.toBeInTheDocument();
  });
});
