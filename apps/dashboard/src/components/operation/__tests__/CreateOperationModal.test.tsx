import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { CreateOperationModal } from "../CreateOperationModal";

const mockFetch = vi.fn();

describe("CreateOperationModal", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    mockFetch.mockReset();
  });

  it("open=false일 때 렌더링하지 않는다", () => {
    render(<CreateOperationModal open={false} onClose={vi.fn()} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("open=true일 때 모달을 렌더링한다", () => {
    render(<CreateOperationModal open={true} onClose={vi.fn()} isAdmin />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("타입 선택 버튼 2개를 표시한다", () => {
    render(<CreateOperationModal open={true} onClose={vi.fn()} isAdmin />);
    expect(screen.getByText("작전 개시")).toBeInTheDocument();
    expect(screen.getByText("다운타임 개설")).toBeInTheDocument();
  });

  it("제목 입력 필드를 표시한다", () => {
    render(<CreateOperationModal open={true} onClose={vi.fn()} isAdmin />);
    expect(screen.getByLabelText(/제목/)).toBeInTheDocument();
  });

  it("상황 설명 필드를 표시한다", () => {
    render(<CreateOperationModal open={true} onClose={vi.fn()} isAdmin />);
    expect(screen.getByLabelText(/상황 설명/)).toBeInTheDocument();
  });

  it("'작전 개시' 선택 시 아군/적군 필드를 표시한다", async () => {
    const user = userEvent.setup();
    render(<CreateOperationModal open={true} onClose={vi.fn()} isAdmin />);

    await user.click(screen.getByText("작전 개시"));

    expect(screen.getByText(/아군 진영/)).toBeInTheDocument();
    expect(screen.getByText(/적군 진영/)).toBeInTheDocument();
  });

  it("'다운타임 개설' 선택 시 참가자 초대 필드를 표시한다", async () => {
    const user = userEvent.setup();
    render(<CreateOperationModal open={true} onClose={vi.fn()} />);

    await user.click(screen.getByText("다운타임 개설"));

    expect(screen.getByText(/참가자 초대/)).toBeInTheDocument();
  });

  it("취소 버튼 클릭 시 onClose를 호출한다", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<CreateOperationModal open={true} onClose={onClose} isAdmin />);

    await user.click(screen.getByText("취소"));

    expect(onClose).toHaveBeenCalled();
  });

  it("작전 생성 버튼을 표시한다", () => {
    render(<CreateOperationModal open={true} onClose={vi.fn()} isAdmin />);
    expect(screen.getByText("작전 생성")).toBeInTheDocument();
  });

  it("API 성공 시 onCreated 콜백을 호출하고 모달을 닫는다", async () => {
    const user = userEvent.setup();
    const onCreated = vi.fn();
    const onClose = vi.fn();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { id: "op_test", title: "테스트 작전" } }),
    });

    render(
      <CreateOperationModal open={true} onClose={onClose} onCreated={onCreated} isAdmin />,
    );

    await user.click(screen.getByText("작전 개시"));
    await user.type(screen.getByLabelText(/제목/), "테스트 작전");
    await user.click(screen.getByText("작전 생성"));

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
      expect(onCreated).toHaveBeenCalled();
    });
  });

  it("API 실패 시 에러 메시지를 표시한다", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "FAILED_TO_CREATE_OPERATION" }),
    });

    render(<CreateOperationModal open={true} onClose={vi.fn()} isAdmin />);

    await user.click(screen.getByText("작전 개시"));
    await user.type(screen.getByLabelText(/제목/), "테스트 작전");
    await user.click(screen.getByText("작전 생성"));

    await waitFor(() => {
      expect(screen.getByText("FAILED_TO_CREATE_OPERATION")).toBeInTheDocument();
    });
  });
});
