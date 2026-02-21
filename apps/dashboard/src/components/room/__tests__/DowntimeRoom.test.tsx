import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

let realtimeInsertHandler: ((payload: { new: unknown }) => void) | undefined;

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: vi.fn(), push: vi.fn() }),
}));

// Supabase Realtime 구독 모킹 (테스트 환경에서 env 불필요)
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    channel: () => {
      const channel = {
        on: vi.fn((_event: string, _filter: unknown, cb: (payload: { new: unknown }) => void) => {
          realtimeInsertHandler = cb;
          return channel;
        }),
        subscribe: vi.fn(() => channel),
        unsubscribe: vi.fn(),
      };
      return channel;
    },
  }),
}));

import { DowntimeRoom } from "../DowntimeRoom";
import {
  mockParticipants,
  mockRoomMessages,
} from "../mock-room-data";

describe("DowntimeRoom", () => {
  const defaultProps = {
    operationId: "op-test-1",
    isParticipant: true,
    roomTitle: "중앙 아케이드 야간 순찰",
    participants: mockParticipants,
    initialMessages: mockRoomMessages,
    currentUserId: "p2",
  };

  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            id: "msg-api-1",
            senderId: "p2",
            senderName: "루시엘 린",
            senderAvatarUrl: undefined,
            content: "안녕하세요",
            timestamp: "2026-02-20T01:39:00.000Z",
          },
        }),
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("상단 바에 방 제목을 표시한다", () => {
    render(<DowntimeRoom {...defaultProps} />);
    expect(screen.getByText("중앙 아케이드 야간 순찰")).toBeInTheDocument();
  });

  it("참가자 수를 표시한다", () => {
    render(<DowntimeRoom {...defaultProps} />);
    expect(screen.getByTestId("participant-count")).toHaveTextContent("3명");
  });

  it("뒤로가기 버튼을 표시한다", () => {
    render(<DowntimeRoom {...defaultProps} />);
    expect(screen.getByTestId("back-button")).toBeInTheDocument();
  });

  it("메뉴 버튼을 표시한다", () => {
    render(<DowntimeRoom {...defaultProps} />);
    expect(screen.getByTestId("menu-button")).toBeInTheDocument();
  });

  it("채팅 로그를 렌더링한다", () => {
    render(<DowntimeRoom {...defaultProps} />);
    expect(screen.getByTestId("room-chat-log")).toBeInTheDocument();
  });

  it("입력 영역을 렌더링한다", () => {
    render(<DowntimeRoom {...defaultProps} />);
    expect(screen.getByTestId("chat-input")).toBeInTheDocument();
    expect(screen.getByTestId("send-button")).toBeInTheDocument();
  });

  it("관전자(isParticipant=false)는 입력 영역과 서사반영 버튼을 보지 못한다", () => {
    render(<DowntimeRoom {...defaultProps} isParticipant={false} />);
    expect(screen.queryByTestId("chat-input")).not.toBeInTheDocument();
    expect(screen.queryByTestId("send-button")).not.toBeInTheDocument();
    expect(screen.queryByTestId("narrative-request-btn")).not.toBeInTheDocument();
  });

  it("서사반영 버튼을 표시한다", () => {
    render(<DowntimeRoom {...defaultProps} />);
    expect(screen.getByTestId("narrative-request-btn")).toBeInTheDocument();
  });

  it("전투전환 버튼은 없다", () => {
    render(<DowntimeRoom {...defaultProps} />);
    expect(screen.queryByTestId("battle-convert-btn")).not.toBeInTheDocument();
  });

  it("빈 입력일 때 전송 버튼이 비활성화된다", () => {
    render(<DowntimeRoom {...defaultProps} />);
    expect(screen.getByTestId("send-button")).toBeDisabled();
  });

  it("텍스트 입력 후 전송 버튼이 활성화된다", () => {
    render(<DowntimeRoom {...defaultProps} />);
    const input = screen.getByTestId("chat-input");
    fireEvent.change(input, { target: { value: "테스트 서술" } });
    expect(screen.getByTestId("send-button")).not.toBeDisabled();
  });

  it("전송 버튼 클릭 시 메시지가 즉시 추가된다", async () => {
    render(<DowntimeRoom {...defaultProps} />);
    const input = screen.getByTestId("chat-input");

    fireEvent.change(input, { target: { value: "안녕하세요" } });
    fireEvent.click(screen.getByTestId("send-button"));

    expect(await screen.findByText("안녕하세요")).toBeInTheDocument();
    expect(input).toHaveValue("");
  });

  it("Enter 키로 전송하면 메시지가 즉시 추가된다", async () => {
    render(<DowntimeRoom {...defaultProps} />);
    const input = screen.getByTestId("chat-input");

    fireEvent.change(input, { target: { value: "안녕하세요" } });
    fireEvent.keyDown(input, { key: "Enter", shiftKey: false });

    expect(await screen.findByText("안녕하세요")).toBeInTheDocument();
    expect(input).toHaveValue("");
  });

  it("Shift+Enter로는 전송하지 않는다", () => {
    render(<DowntimeRoom {...defaultProps} />);
    const input = screen.getByTestId("chat-input");

    fireEvent.change(input, { target: { value: "줄바꿈 테스트" } });
    fireEvent.keyDown(input, { key: "Enter", shiftKey: true });

    // 입력 필드에 텍스트가 남아있어야 함
    expect(input).toHaveValue("줄바꿈 테스트");
  });

  it("한글 조합 중 Enter는 전송하지 않는다", () => {
    render(<DowntimeRoom {...defaultProps} />);
    const input = screen.getByTestId("chat-input");

    fireEvent.change(input, { target: { value: "ㅋㅋㅋ" } });
    fireEvent.keyDown(input, {
      key: "Enter",
      shiftKey: false,
      isComposing: true,
      keyCode: 229,
    });

    expect(input).toHaveValue("ㅋㅋㅋ");
  });

  it("서사반영 클릭 시 범위 선택 모드에 진입한다", () => {
    render(<DowntimeRoom {...defaultProps} />);
    fireEvent.click(screen.getByTestId("narrative-request-btn"));

    // 선택 안내 메시지 표시
    expect(screen.getByText("서사 반영할 시작 메시지를 선택하세요")).toBeInTheDocument();
    // 입력 영역 숨김, 확인/취소 바 표시
    expect(screen.queryByTestId("chat-input")).not.toBeInTheDocument();
    expect(screen.getByTestId("cancel-selection-btn")).toBeInTheDocument();
    expect(screen.getByTestId("confirm-request-btn")).toBeInTheDocument();
  });

  it("범위 선택 취소 시 입력 영역으로 복귀한다", () => {
    render(<DowntimeRoom {...defaultProps} />);
    fireEvent.click(screen.getByTestId("narrative-request-btn"));
    fireEvent.click(screen.getByTestId("cancel-selection-btn"));

    expect(screen.getByTestId("chat-input")).toBeInTheDocument();
    expect(screen.queryByTestId("cancel-selection-btn")).not.toBeInTheDocument();
  });

  it("기존 목 데이터의 서사 반영 요청 카드를 표시한다", () => {
    render(<DowntimeRoom {...defaultProps} />);
    expect(screen.getByTestId("narrative-request-card")).toBeInTheDocument();
    expect(screen.getByText("관리자 검토 대기중")).toBeInTheDocument();
  });

  it("새 참가자 메시지는 참가자 목록 갱신 후 sender 이름이 보정된다", async () => {
    const { rerender } = render(<DowntimeRoom {...defaultProps} participants={[mockParticipants[1]]} />);

    act(() => {
      realtimeInsertHandler?.({
        new: {
          id: "msg-realtime-1",
          operation_id: "op-test-1",
          type: "narration",
          content: "새로 참가했어요",
          created_at: "2026-02-21T11:30:00.000Z",
          sender_character_id: "p9",
        },
      });
    });

    expect(await screen.findByText("새로 참가했어요")).toBeInTheDocument();
    expect(screen.getAllByText("알 수 없음").length).toBeGreaterThan(0);

    rerender(
      <DowntimeRoom
        {...defaultProps}
        participants={[mockParticipants[1], { id: "p9", name: "신규 참가자", avatarUrl: undefined }]}
      />,
    );

    expect(await screen.findByText("신규 참가자")).toBeInTheDocument();
  });
});
