import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  default: (props: any) => <img {...props} />,
}));

import { CharacterCard } from "../CharacterCard";
import type { RegistryCharacterSummary } from "../registry-data";

const bureau: RegistryCharacterSummary = {
  id: "reg-1",
  isMine: true,
  name: "아마츠키 레이",
  faction: "bureau",
  abilityClass: "field",
  avatarUrl: "https://example.com/avatar.jpg",
  isLeader: true,
};

const staticChar: RegistryCharacterSummary = {
  id: "reg-6",
  isMine: false,
  name: "크로우 제로",
  faction: "static",
  abilityClass: "shift",
  avatarUrl: "https://example.com/static.jpg",
  isLeader: true,
};

const defector: RegistryCharacterSummary = {
  id: "reg-11",
  isMine: false,
  name: "카이 렌",
  faction: "defector",
  abilityClass: "field",
  avatarUrl: "https://example.com/defector.jpg",
  isLeader: false,
};

const nonLeader: RegistryCharacterSummary = {
  ...bureau,
  id: "reg-2",
  name: "세나 벨",
  isLeader: false,
};

describe("CharacterCard", () => {
  it("캐릭터 이름을 렌더링한다", () => {
    render(<CharacterCard character={bureau} onSelect={() => {}} />);
    expect(screen.getByText("아마츠키 레이")).toBeInTheDocument();
  });

  it("능력 계열을 표시한다", () => {
    render(<CharacterCard character={bureau} onSelect={() => {}} />);
    expect(screen.getByText("역장")).toBeInTheDocument();
  });

  it("Enforcer 소속 풀네임을 표시한다", () => {
    render(<CharacterCard character={bureau} onSelect={() => {}} />);
    expect(screen.getByText("Solaris Bureau of Civic Security")).toBeInTheDocument();
  });

  it("Static 소속 풀네임을 표시한다", () => {
    render(<CharacterCard character={staticChar} onSelect={() => {}} />);
    expect(screen.getByText("The Static")).toBeInTheDocument();
  });

  it("isLeader=true → ★ 리더 마크를 표시한다", () => {
    render(<CharacterCard character={bureau} onSelect={() => {}} />);
    expect(screen.getByText("LEADER")).toBeInTheDocument();
  });

  it("isLeader=false → 리더 마크 없음", () => {
    render(<CharacterCard character={nonLeader} onSelect={() => {}} />);
    expect(screen.queryByText("LEADER")).not.toBeInTheDocument();
  });

  it("defector → 전향자 풀네임으로 표시한다", () => {
    render(<CharacterCard character={defector} onSelect={() => {}} />);
    expect(screen.getByText("전향자")).toBeInTheDocument();
  });

  it("아바타 이미지를 렌더링한다", () => {
    render(<CharacterCard character={bureau} onSelect={() => {}} />);
    const img = screen.getByAltText("아마츠키 레이 아바타");
    expect(img).toBeInTheDocument();
  });

  it("카드 클릭 시 onSelect를 호출한다", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<CharacterCard character={bureau} onSelect={onSelect} />);

    await user.click(screen.getByRole("button", { name: /아마츠키 레이 상세 보기/ }));
    expect(onSelect).toHaveBeenCalledWith(bureau);
  });

  it("isMine=true → 프라이머리 보더", () => {
    const { container } = render(<CharacterCard character={bureau} onSelect={() => {}} />);
    const article = container.querySelector("article");
    expect(article?.className).toContain("border-primary/20");
  });

  it("isMine=false → 기본 보더", () => {
    const { container } = render(<CharacterCard character={staticChar} onSelect={() => {}} />);
    const article = container.querySelector("article");
    expect(article?.className).toContain("border-border");
  });

  it("팩션 stripe를 렌더링한다 (bureau=primary)", () => {
    const { container } = render(<CharacterCard character={bureau} onSelect={() => {}} />);
    const stripe = container.querySelector(".bg-primary");
    expect(stripe).toBeInTheDocument();
  });

  it("defector → accent stripe (Static과 동일)", () => {
    const { container } = render(<CharacterCard character={defector} onSelect={() => {}} />);
    const stripe = container.querySelector(".bg-accent");
    expect(stripe).toBeInTheDocument();
  });
});
