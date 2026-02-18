import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { FilterChips } from "../FilterChips";

const options = [
  { label: "전체", value: "all" },
  { label: "전투", value: "battle" },
  { label: "시스템", value: "system" },
  { label: "RP", value: "rp" },
];

describe("FilterChips", () => {
  it("모든 옵션의 라벨을 렌더링한다", () => {
    render(<FilterChips options={options} selected="all" onChange={() => {}} />);
    expect(screen.getByText("전체")).toBeInTheDocument();
    expect(screen.getByText("전투")).toBeInTheDocument();
    expect(screen.getByText("시스템")).toBeInTheDocument();
    expect(screen.getByText("RP")).toBeInTheDocument();
  });

  it("선택된 칩에 활성 스타일(primary 배경)을 적용한다", () => {
    render(<FilterChips options={options} selected="battle" onChange={() => {}} />);
    const activeChip = screen.getByText("전투");
    expect(activeChip).toHaveClass("bg-primary");
  });

  it("미선택 칩에 비활성 스타일(subtle 배경)을 적용한다", () => {
    render(<FilterChips options={options} selected="battle" onChange={() => {}} />);
    const inactiveChip = screen.getByText("전체");
    expect(inactiveChip).toHaveClass("bg-subtle/50");
  });

  it("칩 클릭 시 onChange를 value와 함께 호출한다", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FilterChips options={options} selected="all" onChange={onChange} />);

    await user.click(screen.getByText("전투"));
    expect(onChange).toHaveBeenCalledWith("battle");
  });

  it("multiSelect=false (기본): 단일 값을 전달한다", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FilterChips options={options} selected="all" onChange={onChange} />);

    await user.click(screen.getByText("시스템"));
    expect(onChange).toHaveBeenCalledWith("system");
  });

  it("multiSelect=true: 여러 개 선택 시 배열을 전달한다", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <FilterChips
        options={options}
        selected={["all"]}
        onChange={onChange}
        multiSelect
      />,
    );

    await user.click(screen.getByText("전투"));
    expect(onChange).toHaveBeenCalledWith(["all", "battle"]);
  });

  it("multiSelect=true: 이미 선택된 칩 클릭 시 선택 해제한다", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <FilterChips
        options={options}
        selected={["all", "battle"]}
        onChange={onChange}
        multiSelect
      />,
    );

    await user.click(screen.getByText("전투"));
    expect(onChange).toHaveBeenCalledWith(["all"]);
  });

  it("가로 스크롤 컨테이너를 가진다 (overflow-x-auto)", () => {
    const { container } = render(
      <FilterChips options={options} selected="all" onChange={() => {}} />,
    );
    const wrapper = container.firstElementChild;
    expect(wrapper?.className).toContain("overflow-x-auto");
  });

  it("className을 전달할 수 있다", () => {
    const { container } = render(
      <FilterChips
        options={options}
        selected="all"
        onChange={() => {}}
        className="custom-class"
      />,
    );
    const wrapper = container.firstElementChild;
    expect(wrapper?.className).toContain("custom-class");
  });

  it("각 칩이 button 역할을 가진다", () => {
    render(<FilterChips options={options} selected="all" onChange={() => {}} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(4);
  });

  it("선택된 칩에 aria-pressed=true를 설정한다", () => {
    render(<FilterChips options={options} selected="battle" onChange={() => {}} />);
    const activeButton = screen.getByText("전투");
    expect(activeButton).toHaveAttribute("aria-pressed", "true");
  });

  it("미선택 칩에 aria-pressed=false를 설정한다", () => {
    render(<FilterChips options={options} selected="battle" onChange={() => {}} />);
    const inactiveButton = screen.getByText("전체");
    expect(inactiveButton).toHaveAttribute("aria-pressed", "false");
  });
});
