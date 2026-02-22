import { render, screen, act, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { CharacterSearchBar } from "../CharacterSearchBar";

describe("CharacterSearchBar", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("검색 입력 필드를 렌더링한다", () => {
    render(<CharacterSearchBar value="" onChange={() => {}} />);
    expect(screen.getByPlaceholderText("캐릭터 검색...")).toBeInTheDocument();
  });

  it("value prop으로 초기값을 설정한다", () => {
    render(<CharacterSearchBar value="아마츠키" onChange={() => {}} />);
    expect(screen.getByDisplayValue("아마츠키")).toBeInTheDocument();
  });

  it("입력 후 300ms debounce 후 onChange가 호출된다", () => {
    const onChange = vi.fn();
    render(<CharacterSearchBar value="" onChange={onChange} />);

    const input = screen.getByPlaceholderText("캐릭터 검색...");

    // fireEvent로 직접 값 변경
    fireEvent.change(input, { target: { value: "레이" } });

    // 아직 호출되지 않음
    expect(onChange).not.toHaveBeenCalled();

    // 300ms 경과
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(onChange).toHaveBeenCalledWith("레이");
  });

  it("연속 입력 시 마지막 값만 전달한다", () => {
    const onChange = vi.fn();
    render(<CharacterSearchBar value="" onChange={onChange} />);

    const input = screen.getByPlaceholderText("캐릭터 검색...");

    fireEvent.change(input, { target: { value: "아" } });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    fireEvent.change(input, { target: { value: "아마" } });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    // 마지막 값 "아마"만 전달
    expect(onChange).toHaveBeenCalledWith("아마");
  });
});
