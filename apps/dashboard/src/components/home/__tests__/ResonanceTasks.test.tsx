import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ResonanceTasks } from "../ResonanceTasks";
import type { ResonanceTask } from "../mock-tasks";

/* next/link를 <a>로 대체 */
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: { href: string; children: React.ReactNode } & Record<string, unknown>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const tasks: ResonanceTask[] = [
  {
    id: "t1",
    type: "BATTLE",
    message: "도전자가 대기 중입니다.",
    count: 1,
    route: "/operation",
  },
  {
    id: "t2",
    type: "SYSTEM",
    message: "오늘의 기분 보고가 누락되었습니다.",
    route: "/operation",
  },
  {
    id: "t3",
    type: "RP",
    message: "야간 순찰 채널에 참여 요청이 있습니다.",
    route: "/operation",
  },
];

describe("ResonanceTasks", () => {
  it("섹션 헤더를 표시한다", () => {
    render(<ResonanceTasks tasks={tasks} />);
    expect(screen.getByText("MY RESONANCE TASKS")).toBeInTheDocument();
    expect(screen.getByText("DIRECTIVE FROM HELIOS")).toBeInTheDocument();
  });

  it("모든 태스크를 렌더링한다", () => {
    render(<ResonanceTasks tasks={tasks} />);
    expect(screen.getByText("도전자가 대기 중입니다.")).toBeInTheDocument();
    expect(screen.getByText("오늘의 기분 보고가 누락되었습니다.")).toBeInTheDocument();
    expect(screen.getByText("야간 순찰 채널에 참여 요청이 있습니다.")).toBeInTheDocument();
  });

  it("타입별 Badge를 표시한다", () => {
    render(<ResonanceTasks tasks={tasks} />);
    expect(screen.getByText("BATTLE")).toBeInTheDocument();
    expect(screen.getByText("SYSTEM")).toBeInTheDocument();
    expect(screen.getByText("RP")).toBeInTheDocument();
  });

  it("count가 있으면 건수를 표시한다", () => {
    render(<ResonanceTasks tasks={tasks} />);
    expect(screen.getByText("(1건)")).toBeInTheDocument();
  });

  it("count가 없으면 건수를 표시하지 않는다", () => {
    render(<ResonanceTasks tasks={[tasks[1]]} />);
    expect(screen.queryByText(/건\)/)).not.toBeInTheDocument();
  });

  it("각 태스크가 올바른 경로로 링크된다", () => {
    render(<ResonanceTasks tasks={tasks} />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(3);
    for (const link of links) {
      expect(link).toHaveAttribute("href", "/operation");
    }
  });

  it("리스트 role을 가진다", () => {
    render(<ResonanceTasks tasks={tasks} />);
    expect(screen.getByRole("list")).toBeInTheDocument();
  });

  it("마지막 아이템을 제외하고 구분선이 있다", () => {
    render(<ResonanceTasks tasks={tasks} />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(3);
    /* 처음 두 항목은 border-b를 가짐 */
    expect(items[0].className).toContain("border-b");
    expect(items[1].className).toContain("border-b");
    /* 마지막 항목은 border-b가 없음 */
    expect(items[2].className).not.toContain("border-b");
  });

  it("태스크가 없으면 빈 상태를 표시한다", () => {
    render(<ResonanceTasks tasks={[]} />);
    expect(screen.getByText("수신된 지시가 없습니다.")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("각 태스크에 화살표 아이콘이 있다", () => {
    render(<ResonanceTasks tasks={tasks} />);
    const list = screen.getByRole("list");
    const arrows = within(list).getAllByText("→");
    expect(arrows).toHaveLength(3);
  });
});
