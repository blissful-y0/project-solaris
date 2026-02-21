import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import type { RoomMessage, RoomParticipant } from "../types";
import { RoomChatLog } from "../RoomChatLog";

const participants: RoomParticipant[] = [
  { id: "p1", name: "나디아 볼코프" },
  { id: "p2", name: "시온" },
  { id: "p3", name: "카이 안데르센" },
];

const baseMessages: RoomMessage[] = [
  {
    id: "msg-1",
    type: "system",
    content: "나디아 볼코프님이 방을 개설했습니다.",
    timestamp: "2026-02-18T20:00:00Z",
  },
  {
    id: "msg-2",
    type: "narration",
    sender: participants[0],
    content: "아케이드의 네온 간판이 깜빡거린다.",
    timestamp: "2026-02-18T20:02:00Z",
    isMine: false,
  },
  {
    id: "msg-3",
    type: "narration",
    sender: participants[1],
    content: "시온은 간판 아래 서서 주변을 살폈다.",
    timestamp: "2026-02-18T20:03:00Z",
    isMine: true,
  },
];

describe("RoomChatLog", () => {
  it("채팅 로그를 렌더링한다", () => {
    render(
      <RoomChatLog
        messages={baseMessages}
        participants={participants}
        currentUserId="p2"
      />,
    );

    expect(screen.getByTestId("room-chat-log")).toBeInTheDocument();
  });

  it("시스템 메시지를 중앙에 렌더링한다", () => {
    render(
      <RoomChatLog
        messages={baseMessages}
        participants={participants}
        currentUserId="p2"
      />,
    );

    const sysMsg = screen.getByTestId("message-msg-1");
    expect(sysMsg).toBeInTheDocument();
    expect(sysMsg).toHaveTextContent("방을 개설했습니다");
  });

  it("내 서술을 우측에 렌더링한다", () => {
    render(
      <RoomChatLog
        messages={baseMessages}
        participants={participants}
        currentUserId="p2"
      />,
    );

    const myMsg = screen.getByTestId("message-msg-3");
    expect(myMsg).toBeInTheDocument();
    expect(myMsg).toHaveTextContent("시온은 간판 아래 서서");
    // 우측 정렬 확인
    expect(myMsg.classList.contains("justify-end") || myMsg.querySelector(".bg-primary\\/10")).toBeTruthy();
  });

  it("타인 서술을 좌측에 이름 헤더와 함께 렌더링한다", () => {
    render(
      <RoomChatLog
        messages={baseMessages}
        participants={participants}
        currentUserId="p2"
      />,
    );

    const otherMsg = screen.getByTestId("message-msg-2");
    expect(otherMsg).toBeInTheDocument();
    expect(otherMsg).toHaveTextContent("나디아 볼코프");
    expect(otherMsg).toHaveTextContent("네온 간판이 깜빡거린다");
  });

  it("서사 반영 요청 카드를 렌더링한다", () => {
    const messagesWithRequest: RoomMessage[] = [
      ...baseMessages,
      {
        id: "msg-req",
        type: "narrative_request",
        sender: participants[0],
        content: "나디아가 서사 반영을 요청했습니다.",
        timestamp: "2026-02-18T20:05:00Z",
        isMine: false,
        narrativeRequest: {
          requesterId: "p1",
          rangeStart: "msg-2",
          rangeEnd: "msg-3",
          status: "pending",
        },
      },
    ];

    render(
      <RoomChatLog
        messages={messagesWithRequest}
        participants={participants}
        currentUserId="p2"
      />,
    );

    expect(screen.getByTestId("narrative-request-card")).toBeInTheDocument();
  });

  it("빈 메시지 배열을 처리한다", () => {
    render(
      <RoomChatLog
        messages={[]}
        participants={participants}
        currentUserId="p2"
      />,
    );

    expect(screen.getByTestId("room-chat-log")).toBeInTheDocument();
  });

  it("범위 선택 모드에서 안내 메시지를 표시한다", () => {
    render(
      <RoomChatLog
        messages={baseMessages}
        participants={participants}
        currentUserId="p2"
        selectingRange
      />,
    );

    expect(screen.getByText("서사 반영할 시작 메시지를 선택하세요")).toBeInTheDocument();
  });
});
