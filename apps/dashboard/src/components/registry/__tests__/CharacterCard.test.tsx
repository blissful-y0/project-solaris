import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  default: (props: any) => <img {...props} />,
}));

import { CharacterCard } from "../CharacterCard";
import { REGISTRY_CHARACTERS } from "../mock-registry-data";

const bureau = REGISTRY_CHARACTERS[0]; // 아마츠키 레이, bureau, field, isLeader
const staticChar = REGISTRY_CHARACTERS[5]; // 크로우 제로, static, shift, isLeader
const civilian = REGISTRY_CHARACTERS[10]; // 하나 유이, civilian, null

describe("CharacterCard", () => {
  it("캐릭터 이름을 렌더링한다", () => {
    render(<CharacterCard character={bureau} onSelect={() => {}} />);
    expect(screen.getByText("아마츠키 레이")).toBeInTheDocument();
  });

  it("능력 계열을 표시한다", () => {
    render(<CharacterCard character={bureau} onSelect={() => {}} />);
    expect(screen.getByText("역장")).toBeInTheDocument();
  });

  it("Bureau 소속 Badge를 표시한다", () => {
    render(<CharacterCard character={bureau} onSelect={() => {}} />);
    expect(screen.getByText("BUREAU")).toBeInTheDocument();
  });

  it("Static 소속 Badge를 표시한다", () => {
    render(<CharacterCard character={staticChar} onSelect={() => {}} />);
    expect(screen.getByText("STATIC")).toBeInTheDocument();
  });

  it("isLeader=true → LEADER Badge를 표시한다", () => {
    render(<CharacterCard character={bureau} onSelect={() => {}} />);
    expect(screen.getByText("LEADER")).toBeInTheDocument();
  });

  it("isLeader=false → LEADER Badge 없음", () => {
    const nonLeader = REGISTRY_CHARACTERS[1]; // 세나 벨
    render(<CharacterCard character={nonLeader} onSelect={() => {}} />);
    expect(screen.queryByText("LEADER")).not.toBeInTheDocument();
  });

  it("civilian → '비능력자' Badge를 표시한다", () => {
    render(<CharacterCard character={civilian} onSelect={() => {}} />);
    expect(screen.getByText("비능력자")).toBeInTheDocument();
  });

  it("civilian → 능력 계열 텍스트 없음", () => {
    render(<CharacterCard character={civilian} onSelect={() => {}} />);
    expect(screen.queryByText("역장")).not.toBeInTheDocument();
    expect(screen.queryByText("감응")).not.toBeInTheDocument();
  });

  it("아바타 이미지를 렌더링한다", () => {
    render(<CharacterCard character={bureau} onSelect={() => {}} />);
    const img = screen.getByAltText("아마츠키 레이 아바타");
    expect(img).toBeInTheDocument();
  });

  it("클릭 시 onSelect를 호출한다", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<CharacterCard character={bureau} onSelect={onSelect} />);

    await user.click(screen.getByRole("button", { name: /아마츠키 레이 상세 보기/ }));
    expect(onSelect).toHaveBeenCalledWith(bureau);
  });
});
