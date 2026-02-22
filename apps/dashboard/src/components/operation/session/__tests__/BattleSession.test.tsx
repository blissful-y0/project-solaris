import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

import { BattleSession } from "../BattleSession";
import { mockBattleSession } from "../mock-session-data";
import type { BattleSessionData } from "../types";

/* next/link 모킹 */
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [k: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe("BattleSession", () => {
  it("상단 바에 작전 제목과 턴 번호가 표시된다", () => {
    render(<BattleSession initialData={mockBattleSession} />);

    expect(screen.getByText("구역 7-B 정찰 작전")).toBeInTheDocument();
    /* TURN 3은 헤더 + 채팅 로그 시스템 메시지 양쪽에 존재 */
    expect(screen.getAllByText("TURN 3").length).toBeGreaterThanOrEqual(1);
  });

  it("뒤로가기 링크가 /operation을 가리킨다", () => {
    render(<BattleSession initialData={mockBattleSession} />);

    const backLink = screen.getByLabelText("작전 목록으로 돌아가기");
    expect(backLink).toHaveAttribute("href", "/operation");
  });

  it("참가자 HP 바가 표시된다", () => {
    render(<BattleSession initialData={mockBattleSession} />);

    // StatBar + ChatLog에 이름이 여러 번 나올 수 있으므로 getAllByText 사용
    expect(screen.getAllByText("카이 안데르센").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("나디아 볼코프").length).toBeGreaterThanOrEqual(1);
    // HP progressbar 존재 확인
    expect(screen.getByLabelText(/카이 안데르센 HP/)).toBeInTheDocument();
    expect(screen.getByLabelText(/나디아 볼코프 HP/)).toBeInTheDocument();
  });

  it("채팅 로그에 시스템 메시지가 표시된다", () => {
    render(<BattleSession initialData={mockBattleSession} />);

    expect(screen.getByText("TURN 1")).toBeInTheDocument();
  });

  it("채팅 로그에 GM 판정 카드가 표시된다", () => {
    render(<BattleSession initialData={mockBattleSession} />);

    const judgmentCards = screen.getAllByTestId("judgment-card");
    expect(judgmentCards.length).toBeGreaterThanOrEqual(1);
  });

  it("my_turn 페이즈일 때 행동 입력 UI가 표시된다", () => {
    render(<BattleSession initialData={mockBattleSession} />);

    expect(screen.getByTestId("action-attack")).toBeInTheDocument();
    expect(screen.getByTestId("ability-select")).toBeInTheDocument();
    expect(screen.getByTestId("narration-input")).toBeInTheDocument();
  });

  it("행동 제출 시 메시지가 채팅 로그에 추가된다", async () => {
    const myTurnData: BattleSessionData = {
      ...mockBattleSession,
      phase: "my_turn",
    };
    const user = userEvent.setup();
    render(<BattleSession initialData={myTurnData} />);

    // 능력 선택
    await user.selectOptions(screen.getByTestId("ability-select"), "a1");
    // 대상 선택
    await user.selectOptions(screen.getByTestId("target-select"), "p2");
    // 서술 입력
    await user.type(screen.getByTestId("narration-input"), "테스트 서술입니다.");
    // 제출
    await user.click(screen.getByTestId("submit-btn"));

    // 제출 후 대기 상태로 전환
    expect(screen.getByText("상대의 서술을 기다리는 중...")).toBeInTheDocument();
  });

  it("참가자를 찾을 수 없으면 에러 메시지를 표시한다", () => {
    const badData: BattleSessionData = {
      ...mockBattleSession,
      myParticipantId: "nonexistent",
    };
    render(<BattleSession initialData={badData} />);

    expect(screen.getByText("참가자 정보를 찾을 수 없습니다.")).toBeInTheDocument();
  });

  it("초기 데이터가 갱신되면 참가자 목록도 갱신된다", () => {
    const { rerender } = render(<BattleSession initialData={mockBattleSession} />);

    const updated: BattleSessionData = {
      ...mockBattleSession,
      participants: [
        ...mockBattleSession.participants,
        {
          id: "p-new",
          name: "신규 참가자",
          faction: "static",
          team: "enemy",
          hp: { current: 100, max: 100 },
          will: { current: 100, max: 100 },
          abilities: [],
        },
      ],
    };

    rerender(<BattleSession initialData={updated} />);
    expect(screen.getAllByText("신규 참가자").length).toBeGreaterThanOrEqual(1);
  });
});
