import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  default: (props: any) => <img {...props} />,
}));

import { CharacterProfileModal } from "../CharacterProfileModal";
import { REGISTRY_CHARACTERS } from "../mock-registry-data";

const bureau = REGISTRY_CHARACTERS[0]; // 아마츠키 레이, bureau, field, isLeader
const civilian = REGISTRY_CHARACTERS[10]; // 하나 유이, civilian

describe("CharacterProfileModal", () => {
  it("캐릭터 이름을 표시한다", () => {
    render(
      <CharacterProfileModal character={bureau} open onClose={() => {}} />,
    );
    expect(screen.getByText("아마츠키 레이")).toBeInTheDocument();
  });

  it("소속 풀네임 Badge를 표시한다 (Bureau)", () => {
    render(
      <CharacterProfileModal character={bureau} open onClose={() => {}} />,
    );
    expect(
      screen.getByText("Solaris Bureau of Civic Security"),
    ).toBeInTheDocument();
  });

  it("isLeader=true → LEADER Badge 표시", () => {
    render(
      <CharacterProfileModal character={bureau} open onClose={() => {}} />,
    );
    expect(screen.getByText("LEADER")).toBeInTheDocument();
  });

  it("StatBar 2개 (HP + WILL)를 렌더링한다", () => {
    render(
      <CharacterProfileModal character={bureau} open onClose={() => {}} />,
    );
    const progressBars = screen.getAllByRole("progressbar");
    expect(progressBars.length).toBe(2);
  });

  it("HP 수치를 표시한다", () => {
    render(
      <CharacterProfileModal character={bureau} open onClose={() => {}} />,
    );
    expect(screen.getByText("72/80")).toBeInTheDocument();
  });

  it("WILL 수치를 표시한다", () => {
    render(
      <CharacterProfileModal character={bureau} open onClose={() => {}} />,
    );
    expect(screen.getByText("190/250")).toBeInTheDocument();
  });

  it("AbilityAccordion을 렌더링한다 (능력 이름 확인)", () => {
    render(
      <CharacterProfileModal character={bureau} open onClose={() => {}} />,
    );
    expect(screen.getByText("압축 역장")).toBeInTheDocument();
    expect(screen.getByText("역장 분쇄")).toBeInTheDocument();
    expect(screen.getByText("절대영역")).toBeInTheDocument();
  });

  it("공명율을 표시한다", () => {
    render(
      <CharacterProfileModal character={bureau} open onClose={() => {}} />,
    );
    expect(screen.getByText("87%")).toBeInTheDocument();
  });

  it("외형 설명을 표시한다", () => {
    render(
      <CharacterProfileModal character={bureau} open onClose={() => {}} />,
    );
    expect(screen.getByText(bureau.appearance)).toBeInTheDocument();
  });

  it("배경 서사를 표시한다", () => {
    render(
      <CharacterProfileModal character={bureau} open onClose={() => {}} />,
    );
    expect(screen.getByText(bureau.backstory)).toBeInTheDocument();
  });

  it("civilian → AbilityAccordion 대신 '비능력자' 안내", () => {
    render(
      <CharacterProfileModal character={civilian} open onClose={() => {}} />,
    );
    expect(screen.getByText("등록된 능력이 없습니다")).toBeInTheDocument();
  });

  it("open=false → 모달 미표시", () => {
    render(
      <CharacterProfileModal
        character={bureau}
        open={false}
        onClose={() => {}}
      />,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("아바타 이미지를 큰 사이즈로 렌더링한다", () => {
    render(
      <CharacterProfileModal character={bureau} open onClose={() => {}} />,
    );
    const img = screen.getByAltText("아마츠키 레이 프로필");
    expect(img).toHaveAttribute("width", "96");
    expect(img).toHaveAttribute("height", "96");
  });
});
