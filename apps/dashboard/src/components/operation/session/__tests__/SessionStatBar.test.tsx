import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";

import { SessionStatBar } from "../SessionStatBar";
import type { BattleParticipant } from "../types";

/* ─── 테스트용 참가자 ─── */

const bureau: BattleParticipant = {
  id: "p1",
  name: "카이 안데르센",
  faction: "bureau",
  team: "ally",
  hp: { current: 64, max: 80 },
  will: { current: 198, max: 250 },
  abilities: [],
};

const staticP: BattleParticipant = {
  id: "p2",
  name: "나디아 볼코프",
  faction: "static",
  team: "enemy",
  hp: { current: 72, max: 120 },
  will: { current: 138, max: 150 },
  abilities: [],
};

const ally2: BattleParticipant = {
  id: "p3",
  name: "레이",
  faction: "bureau",
  team: "ally",
  hp: { current: 55, max: 80 },
  will: { current: 180, max: 250 },
  abilities: [],
};

const enemy2: BattleParticipant = {
  id: "p4",
  name: "시온",
  faction: "static",
  team: "enemy",
  hp: { current: 96, max: 120 },
  will: { current: 140, max: 150 },
  abilities: [],
};

describe("SessionStatBar", () => {
  it("1v1: 두 참가자의 HP 바를 렌더링한다", () => {
    render(<SessionStatBar participants={[bureau, staticP]} />);

    expect(screen.getByText("카이 안데르센")).toBeInTheDocument();
    expect(screen.getByText("나디아 볼코프")).toBeInTheDocument();
    expect(screen.getByText("HP 64/80")).toBeInTheDocument();
    expect(screen.getByText("HP 72/120")).toBeInTheDocument();
  });

  it("1v1: HP progressbar에 올바른 aria 속성이 있다", () => {
    render(<SessionStatBar participants={[bureau, staticP]} />);

    const hpBars = screen.getAllByRole("progressbar");
    const kaiBureau = hpBars.find((bar) =>
      bar.getAttribute("aria-label")?.includes("카이 안데르센 HP"),
    );
    expect(kaiBureau).toHaveAttribute("aria-valuenow", "64");
    expect(kaiBureau).toHaveAttribute("aria-valuemax", "80");
  });

  it("기본 상태에서는 WILL 바가 숨겨져 있다", () => {
    render(<SessionStatBar participants={[bureau, staticP]} />);

    expect(screen.queryByText(/WL/)).not.toBeInTheDocument();
  });

  it("클릭하면 WILL 바가 표시된다", async () => {
    const user = userEvent.setup();
    render(<SessionStatBar participants={[bureau, staticP]} />);

    await user.click(screen.getByRole("button"));

    expect(screen.getByText("WL 198/250")).toBeInTheDocument();
    expect(screen.getByText("WL 138/150")).toBeInTheDocument();
  });

  it("2v2: 아군/적군 팀 라벨이 표시된다", () => {
    render(
      <SessionStatBar participants={[bureau, ally2, staticP, enemy2]} />,
    );

    expect(screen.getByText("아군")).toBeInTheDocument();
    expect(screen.getByText("적군")).toBeInTheDocument();
  });

  it("2v2: 네 참가자 모두 표시된다", () => {
    render(
      <SessionStatBar participants={[bureau, ally2, staticP, enemy2]} />,
    );

    expect(screen.getByText("카이 안데르센")).toBeInTheDocument();
    expect(screen.getByText("레이")).toBeInTheDocument();
    expect(screen.getByText("나디아 볼코프")).toBeInTheDocument();
    expect(screen.getByText("시온")).toBeInTheDocument();
  });

  it("확장/접기 힌트 텍스트가 토글된다", async () => {
    const user = userEvent.setup();
    render(<SessionStatBar participants={[bureau, staticP]} />);

    expect(screen.getByText("▼ WILL 상세")).toBeInTheDocument();

    await user.click(screen.getByRole("button"));
    expect(screen.getByText("▲ 접기")).toBeInTheDocument();
  });
});
