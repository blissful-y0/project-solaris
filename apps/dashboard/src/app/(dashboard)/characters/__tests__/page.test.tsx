import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  default: (props: any) => <img {...props} />,
}));

import CharactersPage from "../page";

describe("CharactersPage", () => {
  it("페이지 헤더를 렌더링한다", () => {
    render(<CharactersPage />);
    expect(screen.getByText("REGISTRY // CITIZEN DATABASE")).toBeInTheDocument();
  });

  it("검색바를 렌더링한다", () => {
    render(<CharactersPage />);
    expect(
      screen.getByPlaceholderText("캐릭터 검색..."),
    ).toBeInTheDocument();
  });

  it("소속 필터 칩을 렌더링한다", () => {
    render(<CharactersPage />);
    /* Bureau/Static은 필터 칩에만 존재 (카드 Badge는 대문자 BUREAU/STATIC) */
    expect(screen.getByText("Bureau")).toBeInTheDocument();
    expect(screen.getByText("Static")).toBeInTheDocument();
    /* 비능력자는 필터 칩 + civilian 카드 Badge에 모두 존재 */
    expect(screen.getAllByText("비능력자").length).toBeGreaterThanOrEqual(1);
  });

  it("모든 캐릭터 카드를 렌더링한다 (12명)", () => {
    render(<CharactersPage />);
    expect(screen.getByText("아마츠키 레이")).toBeInTheDocument();
    expect(screen.getByText("크로우 제로")).toBeInTheDocument();
    expect(screen.getByText("하나 유이")).toBeInTheDocument();
  });

  it("Bureau 필터 → Bureau 캐릭터만 표시", async () => {
    const user = userEvent.setup();
    render(<CharactersPage />);

    await user.click(screen.getByText("Bureau"));
    expect(screen.getByText("아마츠키 레이")).toBeInTheDocument();
    expect(screen.queryByText("크로우 제로")).not.toBeInTheDocument();
    expect(screen.queryByText("하나 유이")).not.toBeInTheDocument();
  });

  it("캐릭터 카드 클릭 → 프로필 모달 표시", async () => {
    const user = userEvent.setup();
    render(<CharactersPage />);

    await user.click(
      screen.getByRole("button", { name: /아마츠키 레이 상세 보기/ }),
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByText("Solaris Bureau of Civic Security"),
    ).toBeInTheDocument();
  });

  it("검색어 입력 → 매칭 캐릭터만 표시", async () => {
    vi.useFakeTimers();
    render(<CharactersPage />);

    const input = screen.getByPlaceholderText("캐릭터 검색...");
    fireEvent.change(input, { target: { value: "아마츠키" } });

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText("아마츠키 레이")).toBeInTheDocument();
    expect(screen.queryByText("크로우 제로")).not.toBeInTheDocument();

    vi.useRealTimers();
  });
});
