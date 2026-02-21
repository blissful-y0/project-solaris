import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import type { NarrativeRequest, RoomMessage, RoomParticipant } from "../types";
import { NarrativeRequestCard } from "../NarrativeRequestCard";

const participants: RoomParticipant[] = [
  { id: "p1", name: "나디아 볼코프" },
  { id: "p2", name: "시온" },
  { id: "p3", name: "카이 안데르센" },
];

const rangeMessages: RoomMessage[] = [
  {
    id: "msg-4",
    type: "narration",
    sender: participants[0],
    content: "아케이드의 네온 간판이 깜빡거리며 골목을 비춘다.",
    timestamp: "2026-02-18T20:02:00Z",
    isMine: false,
  },
  {
    id: "msg-5",
    type: "narration",
    sender: participants[1],
    content: "시온은 간판 아래 서서 주변을 살폈다.",
    timestamp: "2026-02-18T20:03:00Z",
    isMine: true,
  },
  {
    id: "msg-9",
    type: "narration",
    sender: participants[2],
    content: "카이가 시온의 단말기를 힐끗 보더니 눈을 가늘게 떴다.",
    timestamp: "2026-02-18T20:07:00Z",
    isMine: false,
  },
];

function makeRequest(
  overrides: Partial<NarrativeRequest> = {},
): NarrativeRequest {
  return {
    id: "nr-1",
    requesterId: "p1",
    rangeStart: "msg-4",
    rangeEnd: "msg-9",
    status: "voting",
    votes: {},
    totalParticipants: 3,
    ...overrides,
  };
}

describe("NarrativeRequestCard", () => {
  it("카드를 렌더링한다", () => {
    render(
      <NarrativeRequestCard
        request={makeRequest()}
        participants={participants}
      />,
    );

    expect(screen.getByTestId("narrative-request-card")).toBeInTheDocument();
    expect(screen.getByText(/NARRATIVE REVIEW/)).toBeInTheDocument();
  });

  it("요청자 이름을 표시한다", () => {
    render(
      <NarrativeRequestCard
        request={makeRequest()}
        participants={participants}
      />,
    );

    expect(
      screen.getByText(/나디아 볼코프/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/서사 반영을 요청/),
    ).toBeInTheDocument();
  });

  it("대기중 상태를 표시한다", () => {
    render(
      <NarrativeRequestCard
        request={makeRequest({ status: "voting" })}
        participants={participants}
      />,
    );

    expect(screen.getByText("관리자 검토 대기중")).toBeInTheDocument();
  });

  it("승인 상태를 표시한다", () => {
    render(
      <NarrativeRequestCard
        request={makeRequest({ status: "approved" })}
        participants={participants}
      />,
    );

    expect(screen.getByText("서사 반영 승인됨")).toBeInTheDocument();
  });

  it("반려 상태를 표시한다", () => {
    render(
      <NarrativeRequestCard
        request={makeRequest({ status: "rejected" })}
        participants={participants}
      />,
    );

    expect(screen.getByText("서사 반영 반려됨")).toBeInTheDocument();
  });

  it("messages 전달 시 범위 내 메시지 개수를 표시한다", () => {
    render(
      <NarrativeRequestCard
        request={makeRequest()}
        participants={participants}
        messages={rangeMessages}
      />,
    );

    expect(screen.getByText("3건")).toBeInTheDocument();
  });

  it("messages 전달 시 범위 미리보기를 표시한다", () => {
    render(
      <NarrativeRequestCard
        request={makeRequest()}
        participants={participants}
        messages={rangeMessages}
      />,
    );

    const preview = screen.getByTestId("narrative-range-preview");
    expect(preview).toBeInTheDocument();
    // 첫 메시지 작성자 + 내용 truncate
    expect(preview).toHaveTextContent("나디아 볼코프");
    expect(preview).toHaveTextContent("아케이드의 네온 간판이");
    // 마지막 메시지 작성자
    expect(preview).toHaveTextContent("카이 안데르센");
  });

  it("messages 없으면 범위 미리보기를 표시하지 않는다", () => {
    render(
      <NarrativeRequestCard
        request={makeRequest()}
        participants={participants}
      />,
    );

    expect(screen.queryByTestId("narrative-range-preview")).not.toBeInTheDocument();
  });
});
