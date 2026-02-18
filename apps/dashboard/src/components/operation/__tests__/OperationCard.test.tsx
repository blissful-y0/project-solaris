import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OperationCard } from "../OperationCard";
import type { OperationItem } from "../types";

const battleOp: OperationItem = {
  id: "op-001",
  title: "구역 7-B 정찰 작전",
  type: "전투",
  status: "대기중",
  participants: 2,
  maxParticipants: 4,
  host: "카이 안데르센",
  summary: "외곽 구역 비동조 신호 탐지.",
};

const rpOp: OperationItem = {
  id: "op-002",
  title: "중앙 아케이드 야간 순찰",
  type: "RP",
  status: "진행중",
  participants: 3,
  maxParticipants: 6,
  host: "나디아 볼코프",
  summary: "민간 구역 순찰 중 발생하는 일상적 교류.",
};

const completedOp: OperationItem = {
  ...battleOp,
  id: "op-005",
  status: "완료",
  title: "외곽 지구 전면 공세",
};

describe("OperationCard", () => {
  it("작전 제목을 렌더링한다", () => {
    render(<OperationCard item={battleOp} />);
    expect(screen.getByText("구역 7-B 정찰 작전")).toBeInTheDocument();
  });

  it("작전 요약을 렌더링한다", () => {
    render(<OperationCard item={battleOp} />);
    expect(screen.getByText("외곽 구역 비동조 신호 탐지.")).toBeInTheDocument();
  });

  it("호스트 이름을 표시한다", () => {
    render(<OperationCard item={battleOp} />);
    expect(screen.getByText("카이 안데르센")).toBeInTheDocument();
  });

  it("참가자 수를 표시한다", () => {
    render(<OperationCard item={battleOp} />);
    expect(screen.getByText("2/4")).toBeInTheDocument();
  });

  it("전투 타입에 info Badge를 표시한다", () => {
    render(<OperationCard item={battleOp} />);
    expect(screen.getByText("전투")).toBeInTheDocument();
  });

  it("RP 타입에 warning Badge를 표시한다", () => {
    render(<OperationCard item={rpOp} />);
    expect(screen.getByText("RP")).toBeInTheDocument();
  });

  it("대기중 상태를 표시한다", () => {
    render(<OperationCard item={battleOp} />);
    expect(screen.getByText("대기중")).toBeInTheDocument();
  });

  it("진행중 상태에 success 색상을 적용한다", () => {
    render(<OperationCard item={rpOp} />);
    const status = screen.getByText("진행중");
    expect(status).toHaveClass("text-success");
  });

  it("완료 상태를 표시한다", () => {
    render(<OperationCard item={completedOp} />);
    expect(screen.getByText("완료")).toBeInTheDocument();
  });

  it("article 요소로 렌더링한다", () => {
    render(<OperationCard item={battleOp} />);
    expect(screen.getByRole("article")).toBeInTheDocument();
  });
});
