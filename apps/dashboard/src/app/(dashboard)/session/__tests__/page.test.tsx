import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import SessionPage from "../page";

describe("SessionPage", () => {
  it("기본 진입 시 전투 허브 목록을 보여준다", () => {
    render(<SessionPage />);

    expect(screen.getByText("SESSION HUB")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "전투" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "RP" })).toBeInTheDocument();
    expect(screen.getByText("폐허지대 교전 - Sector 7")).toBeInTheDocument();
    expect(screen.getByText("참여 8명")).toBeInTheDocument();
    expect(screen.getByText("대기중")).toBeInTheDocument();
  });

  it("RP 모드로 전환하면 RP 방 목록을 보여준다", async () => {
    const user = userEvent.setup();
    render(<SessionPage />);

    await user.click(screen.getByRole("button", { name: "RP" }));

    expect(screen.getByText("중앙 감시탑 브리핑룸")).toBeInTheDocument();
    expect(screen.getByText("참여 5명")).toBeInTheDocument();
    expect(screen.getByText("진행중")).toBeInTheDocument();
    expect(screen.queryByText("폐허지대 교전 - Sector 7")).not.toBeInTheDocument();
  });
});
