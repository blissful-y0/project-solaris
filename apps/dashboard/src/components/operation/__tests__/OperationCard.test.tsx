import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { OperationCard } from "../OperationCard";
import type { OperationItem } from "../types";

/** OPERATION 타입 LIVE 상태 */
const liveOperation: OperationItem = {
  id: "op-001",
  title: "구역 7-B 정찰 작전",
  type: "operation",
  status: "live",
  teamA: [
    { id: "ch-001", name: "카이 안데르센" },
    { id: "ch-002", name: "아마츠키 레이" },
  ],
  teamB: [{ id: "ch-003", name: "나디아 볼코프" }],
  host: { id: "ch-001", name: "카이 안데르센" },
  summary: "외곽 구역 비동조 신호 탐지.",
  maxParticipants: 4,
  createdAt: "2026-02-18T06:30:00Z",
};

/** DOWNTIME 타입 대기 상태 */
const waitingDowntime: OperationItem = {
  id: "op-002",
  title: "중앙 아케이드 야간 순찰",
  type: "downtime",
  status: "waiting",
  teamA: [],
  teamB: [],
  host: { id: "ch-003", name: "나디아 볼코프" },
  summary: "민간 구역 순찰 중 발생하는 일상적 교류.",
  maxParticipants: 6,
  createdAt: "2026-02-18T05:48:00Z",
};

/** 완료 상태 OPERATION */
const completedOperation: OperationItem = {
  id: "op-005",
  title: "외곽 지구 전면 공세",
  type: "operation",
  status: "completed",
  teamA: [{ id: "ch-002", name: "아마츠키 레이" }],
  teamB: [{ id: "ch-005", name: "레이 노바크" }],
  host: { id: "ch-002", name: "아마츠키 레이" },
  summary: "Static 거점 확인 및 제압 완료.",
  maxParticipants: 4,
  createdAt: "2026-02-16T08:00:00Z",
};

describe("OperationCard", () => {
  /* --- 기본 렌더링 --- */
  it("작전 제목을 렌더링한다", () => {
    render(<OperationCard item={liveOperation} />);
    expect(screen.getByText("구역 7-B 정찰 작전")).toBeInTheDocument();
  });

  it("작전 요약을 렌더링한다", () => {
    render(<OperationCard item={liveOperation} />);
    expect(screen.getByText("외곽 구역 비동조 신호 탐지.")).toBeInTheDocument();
  });

  it("article 요소로 렌더링한다", () => {
    render(<OperationCard item={liveOperation} />);
    expect(screen.getByRole("article")).toBeInTheDocument();
  });

  /* --- 상태별 stripe 색상 --- */
  it("LIVE 상태에서 green stripe를 표시한다", () => {
    render(<OperationCard item={liveOperation} />);
    const stripe = screen.getByTestId("status-stripe");
    expect(stripe).toHaveClass("bg-emerald-500");
  });

  it("대기 상태에서 cyan stripe를 표시한다", () => {
    render(<OperationCard item={waitingDowntime} />);
    const stripe = screen.getByTestId("status-stripe");
    expect(stripe).toHaveClass("bg-primary");
  });

  it("완료 상태에서 gray stripe를 표시한다", () => {
    render(<OperationCard item={completedOperation} />);
    const stripe = screen.getByTestId("status-stripe");
    expect(stripe).toHaveClass("bg-text-secondary/30");
  });

  /* --- 상태 인디케이터 --- */
  it("LIVE 상태에 '● LIVE' 텍스트를 표시한다", () => {
    render(<OperationCard item={liveOperation} />);
    expect(screen.getByText(/LIVE/)).toBeInTheDocument();
  });

  it("대기 상태에 '○ 대기' 텍스트를 표시한다", () => {
    render(<OperationCard item={waitingDowntime} />);
    expect(screen.getByText(/대기/)).toBeInTheDocument();
  });

  it("완료 상태에 '— 완료' 텍스트를 표시한다", () => {
    render(<OperationCard item={completedOperation} />);
    expect(screen.getByText("— 완료")).toBeInTheDocument();
  });

  /* --- 타입 뱃지 --- */
  it("OPERATION 타입에 info 뱃지를 표시한다", () => {
    render(<OperationCard item={liveOperation} />);
    expect(screen.getByText("OPERATION")).toBeInTheDocument();
  });

  it("DOWNTIME 타입에 warning 뱃지를 표시한다", () => {
    render(<OperationCard item={waitingDowntime} />);
    expect(screen.getByText("DOWNTIME")).toBeInTheDocument();
  });

  /* --- 참가자 표시 --- */
  it("OPERATION: 'teamA vs teamB' 형태로 참가자를 표시한다", () => {
    render(<OperationCard item={liveOperation} />);
    expect(screen.getByText(/카이 안데르센, 아마츠키 레이/)).toBeInTheDocument();
    expect(screen.getByText(/vs/)).toBeInTheDocument();
    expect(screen.getByText(/나디아 볼코프/)).toBeInTheDocument();
  });

  it("DOWNTIME: '호스트: 이름' 형태로 표시한다", () => {
    render(<OperationCard item={waitingDowntime} />);
    expect(screen.getByText(/호스트:/)).toBeInTheDocument();
    expect(screen.getByText(/나디아 볼코프/)).toBeInTheDocument();
  });

  /* --- 인원 수 --- */
  it("참가자 수를 표시한다", () => {
    render(<OperationCard item={liveOperation} />);
    /* teamA(2) + teamB(1) = 3명 */
    expect(screen.getByText(/3\/4명/)).toBeInTheDocument();
  });

  /* --- CTA 텍스트 --- */
  it("LIVE 상태에 '입장 ▸' CTA를 표시한다", () => {
    render(<OperationCard item={liveOperation} />);
    expect(screen.getByText("입장 ▸")).toBeInTheDocument();
  });

  it("대기 상태에 '참가 ▸' CTA를 표시한다", () => {
    render(<OperationCard item={waitingDowntime} />);
    expect(screen.getByText("참가 ▸")).toBeInTheDocument();
  });

  it("완료 상태에 '열람 ▸' CTA를 표시한다", () => {
    render(<OperationCard item={completedOperation} />);
    expect(screen.getByText("열람 ▸")).toBeInTheDocument();
  });

  /* --- 완료 카드 opacity --- */
  it("완료 카드에 opacity 처리를 적용한다", () => {
    render(<OperationCard item={completedOperation} />);
    const article = screen.getByRole("article");
    expect(article).toHaveClass("opacity-60");
  });

  it("LIVE 카드에는 opacity 처리를 적용하지 않는다", () => {
    render(<OperationCard item={liveOperation} />);
    const article = screen.getByRole("article");
    expect(article).not.toHaveClass("opacity-60");
  });

  /* --- 클릭 핸들러 --- */
  it("onClick 콜백을 전달받아 호출한다", async () => {
    const onClick = vi.fn();
    const { getByRole } = render(
      <OperationCard item={liveOperation} onClick={onClick} />,
    );
    const article = getByRole("article");
    article.click();
    expect(onClick).toHaveBeenCalledWith(liveOperation);
  });
});
