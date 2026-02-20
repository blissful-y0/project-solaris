import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { ChatLog } from "../ChatLog";
import type { ChatMessage } from "../types";

const mockMessages: ChatMessage[] = [
  {
    id: "msg-0",
    type: "system",
    content: "TURN 1",
    timestamp: "2026-02-18T14:00:00Z",
  },
  {
    id: "msg-1",
    type: "narration",
    senderId: "p2",
    senderName: "나디아 볼코프",
    content: "증기가 터지는 순간 재는 배관에서 손을 놓고 낙하했다.",
    timestamp: "2026-02-18T14:01:00Z",
    isMine: false,
    action: { actionType: "attack", abilityName: "열 전도", targetName: "카이 안데르센" },
  },
  {
    id: "msg-2",
    type: "narration",
    senderId: "p1",
    senderName: "카이 안데르센",
    content: "거울은 왼쪽 전도관 뒤로 몸을 낮췄다.",
    timestamp: "2026-02-18T14:02:00Z",
    isMine: true,
    action: { actionType: "defend", abilityName: "역장 전개", targetName: "카이 안데르센" },
  },
  {
    id: "msg-3",
    type: "judgment",
    content: "",
    timestamp: "2026-02-18T14:03:00Z",
    judgment: {
      turn: 1,
      participantResults: [
        { participantId: "p1", participantName: "카이", grade: "partial", scores: { narrative: 7, tactical: 6, cost: 7, quality: 7 } },
        { participantId: "p2", participantName: "나디아", grade: "success", scores: { narrative: 8, tactical: 7, cost: 6, quality: 8 } },
      ],
      statChanges: [
        { participantId: "p1", participantName: "카이", stat: "hp", before: 80, after: 65, reason: "피해" },
      ],
    },
  },
  {
    id: "msg-3n",
    type: "gm_narration",
    content: "열이 역장 하단을 침투했다.",
    timestamp: "2026-02-18T14:03:01Z",
  },
];

describe("ChatLog", () => {
  it("시스템 메시지를 렌더링한다", () => {
    render(<ChatLog messages={mockMessages} />);

    const systemMsgs = screen.getAllByTestId("system-message");
    expect(systemMsgs.length).toBeGreaterThanOrEqual(1);
    expect(systemMsgs[0]).toHaveTextContent("TURN 1");
  });

  it("상대 서술(좌측)에 이름 헤더가 표시된다", () => {
    render(<ChatLog messages={mockMessages} />);

    expect(screen.getByText("나디아 볼코프")).toBeInTheDocument();
  });

  it("내 서술 말풍선이 렌더링된다", () => {
    render(<ChatLog messages={mockMessages} />);

    const bubbles = screen.getAllByTestId("narration-bubble");
    const mineBubble = bubbles.find((b) =>
      b.textContent?.includes("거울은 왼쪽 전도관 뒤로"),
    );
    expect(mineBubble).toBeInTheDocument();
  });

  it("행동 뱃지가 올바르게 표시된다", () => {
    render(<ChatLog messages={mockMessages} />);

    expect(screen.getByText("공격")).toBeInTheDocument();
    expect(screen.getByText("방어")).toBeInTheDocument();
  });

  it("능력 이름과 대상이 표시된다", () => {
    render(<ChatLog messages={mockMessages} />);

    expect(screen.getByText(/열 전도 → 카이 안데르센/)).toBeInTheDocument();
  });

  it("GM 판정 카드를 렌더링한다", () => {
    render(<ChatLog messages={mockMessages} />);

    expect(screen.getByTestId("judgment-card")).toBeInTheDocument();
    expect(screen.getByText(/HELIOS COMBAT SYSTEM/)).toBeInTheDocument();
  });

  it("GM 서사를 중앙 텍스트 버블로 렌더링한다", () => {
    render(<ChatLog messages={mockMessages} />);

    const gmBubble = screen.getByTestId("gm-narration-bubble");
    expect(gmBubble).toBeInTheDocument();
    expect(gmBubble).toHaveTextContent("열이 역장 하단을 침투했다.");
  });

  it("빈 메시지 배열이면 빈 로그를 렌더링한다", () => {
    render(<ChatLog messages={[]} />);

    const log = screen.getByTestId("chat-log");
    expect(log.children).toHaveLength(1); // bottomRef div만
  });
});
