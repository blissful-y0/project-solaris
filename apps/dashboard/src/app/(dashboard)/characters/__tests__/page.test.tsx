import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  default: (props: any) => <img {...props} />,
}));

import CharactersPage from "../page";

describe("CharactersPage", () => {
  it("초기 진입 시 목데이터 캐릭터 카드를 렌더링한다", () => {
    render(<CharactersPage />);

    expect(screen.getByText("REGISTRY")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /상세 보기/i })).toHaveLength(6);
  });

  it("팩션 필터를 Bureau로 바꾸면 Bureau 캐릭터만 표시한다", async () => {
    const user = userEvent.setup();
    render(<CharactersPage />);

    await user.click(screen.getByRole("button", { name: "Bureau" }));

    expect(screen.getByText("리온 하르트")).toBeInTheDocument();
    expect(screen.getByText("세나 벨")).toBeInTheDocument();
    expect(screen.queryByText("크로우 제로")).not.toBeInTheDocument();
  });

  it("카드 선택 시 상세 모달을 열고 닫을 수 있다", async () => {
    const user = userEvent.setup();
    render(<CharactersPage />);

    await user.click(
      screen.getByRole("button", { name: "리온 하르트 상세 보기" }),
    );

    const dialog = await screen.findByRole("dialog", {
      name: "리온 하르트 프로필",
    });
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText("능력 계열: 광자 지휘")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "닫기" }));
    expect(screen.queryByRole("dialog", { name: "리온 하르트 프로필" })).not.toBeInTheDocument();
  });
});
