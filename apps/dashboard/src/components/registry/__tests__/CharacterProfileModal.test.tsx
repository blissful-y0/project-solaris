import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  default: (props: any) => <img {...props} />,
}));

import { CharacterProfileModal } from "../CharacterProfileModal";
import type { RegistryCharacter } from "../registry-data";

const bureau: RegistryCharacter = {
  id: "reg-1",
  name: "아마츠키 레이",
  faction: "bureau",
  abilityClass: "field",
  abilities: [
    {
      tier: "basic",
      name: "압축 역장",
      description: "주변 3m 반경에 방어 역장을 형성한다.",
      weakness: "지속 시간 8초 이내.",
      costAmount: 15,
      costType: "will",
    },
    {
      tier: "mid",
      name: "역장 분쇄",
      description: "집중된 역장을 투사체로 변환.",
      weakness: "시전 중 이동 불가.",
      costAmount: 30,
      costType: "will",
    },
    {
      tier: "advanced",
      name: "절대영역",
      description: "반경 10m 역장 돔 전개.",
      weakness: "WILL 대량 소모.",
      costAmount: 60,
      costType: "will",
    },
  ],
  hpMax: 80,
  hpCurrent: 72,
  willMax: 250,
  willCurrent: 190,
  appearance: "은발 단발. 왼쪽 눈 아래 작은 흉터. Bureau 정규 전투복 착용.",
  backstory: "헬리오스 코어 제1 경비대의 에이스.",
  avatarUrl: "https://example.com/avatar.jpg",
  isLeader: true,
  resonanceRate: 87,
};

const noAbilities: RegistryCharacter = {
  id: "reg-11",
  name: "카이 렌",
  faction: "defector",
  abilityClass: "field",
  abilities: [],
  hpMax: 100,
  hpCurrent: 90,
  willMax: 200,
  willCurrent: 180,
  appearance: "긴 코트. Bureau 시절 흉터.",
  backstory: "Bureau 이탈자.",
  avatarUrl: "https://example.com/defector.jpg",
  isLeader: false,
  resonanceRate: 72,
};

describe("CharacterProfileModal", () => {
  it("loading=true → 스켈레톤을 표시한다", () => {
    render(
      <CharacterProfileModal character={null} loading open onClose={() => {}} />,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    /* 데이터 없으므로 이름이 표시되지 않아야 함 */
    expect(screen.queryByText("아마츠키 레이")).not.toBeInTheDocument();
  });

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

  it("능력 없는 캐릭터 → '등록된 능력이 없습니다' 안내", () => {
    render(
      <CharacterProfileModal character={noAbilities} open onClose={() => {}} />,
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
