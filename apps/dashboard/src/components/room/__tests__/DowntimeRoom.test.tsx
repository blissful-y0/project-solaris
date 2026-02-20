import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: vi.fn(), push: vi.fn() }),
}));

const {
  mockCreateClient,
  mockChannel,
  mockOn,
  mockSubscribe,
  mockRemoveChannel,
} = vi.hoisted(() => ({
  mockCreateClient: vi.fn(),
  mockChannel: vi.fn(),
  mockOn: vi.fn(),
  mockSubscribe: vi.fn(),
  mockRemoveChannel: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: mockCreateClient,
}));

import { DowntimeRoom } from "../DowntimeRoom";
import {
  mockParticipants,
  mockRoomMessages,
} from "../mock-room-data";

describe("DowntimeRoom", () => {
  const defaultProps = {
    roomTitle: "중앙 아케이드 야간 순찰",
    participants: mockParticipants,
    initialMessages: mockRoomMessages,
    currentUserId: "p2",
  };

  mockOn.mockReturnValue({ subscribe: mockSubscribe });
  mockChannel.mockReturnValue({ on: mockOn, subscribe: mockSubscribe });
  mockCreateClient.mockReturnValue({
    channel: mockChannel,
    removeChannel: mockRemoveChannel,
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

  it("전송 버튼 클릭 시 메시지가 추가된다", () => {
    render(<DowntimeRoom {...defaultProps} />);
    const input = screen.getByTestId("chat-input");

    fireEvent.change(input, { target: { value: "새로운 서술입니다." } });
    fireEvent.click(screen.getByTestId("send-button"));

    expect(screen.getByText("새로운 서술입니다.")).toBeInTheDocument();
    // 입력 필드 초기화 확인
    expect(input).toHaveValue("");
  });

  it("Enter 키로 메시지를 전송한다", () => {
    render(<DowntimeRoom {...defaultProps} />);
    const input = screen.getByTestId("chat-input");

    fireEvent.change(input, { target: { value: "키보드 전송 테스트" } });
    fireEvent.keyDown(input, { key: "Enter", shiftKey: false });

    expect(screen.getByText("키보드 전송 테스트")).toBeInTheDocument();
  });

  it("Shift+Enter로는 전송하지 않는다", () => {
    render(<DowntimeRoom {...defaultProps} />);
    const input = screen.getByTestId("chat-input");

    fireEvent.change(input, { target: { value: "줄바꿈 테스트" } });
    fireEvent.keyDown(input, { key: "Enter", shiftKey: true });

    // 입력 필드에 텍스트가 남아있어야 함
    expect(input).toHaveValue("줄바꿈 테스트");
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

  it("operationId가 있으면 operation_messages INSERT를 operation_id 필터로 구독한다", () => {
    render(<DowntimeRoom {...defaultProps} operationId="op-1" />);

    expect(mockCreateClient).toHaveBeenCalledTimes(1);
    expect(mockChannel).toHaveBeenCalledWith("operation-messages:op-1");
    expect(mockOn).toHaveBeenCalledWith(
      "postgres_changes",
      expect.objectContaining({
        event: "INSERT",
        schema: "public",
        table: "operation_messages",
        filter: "operation_id=eq.op-1",
      }),
      expect.any(Function),
    );
  });
});
