import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { LorePageClient } from "../LorePageClient";
import type { LoreCategoryContent } from "../types";

const mockContents: LoreCategoryContent[] = [
  { id: "overview", html: "<p>세계 개요 내용</p>" },
  { id: "society", html: "<p>사회 구조 내용</p>" },
  { id: "resonance", html: "<p>공명율 내용</p>" },
  { id: "abilities", html: "<p>능력 분류 내용</p>" },
  { id: "factions", html: "<p>대립 구도 내용</p>" },
  { id: "battle-rules", html: "<p>배틀룰 내용</p>" },
];

describe("LorePageClient", () => {
  it("페이지 타이틀과 터미널 UI를 렌더링한다", () => {
    render(<LorePageClient contents={mockContents} />);
    expect(screen.getByText("HELIOS ARCHIVE v2.1")).toBeInTheDocument();
    expect(screen.getByText("DATABASE", { exact: false })).toBeInTheDocument();
  });

  it("데이터베이스 탭에 LORE_CATEGORIES 정보가 표시된다", () => {
    render(<LorePageClient contents={mockContents} />);
    expect(screen.getByText("WORLD-OVERVIEW")).toBeInTheDocument();
  });

  it("카드를 클릭하면 모달이 열리고 내용이 렌더링된다", async () => {
    const user = userEvent.setup();
    render(<LorePageClient contents={mockContents} />);

    const card = screen.getByText("WORLD-OVERVIEW");
    await user.click(card);

    expect(screen.getByText("SECTION::WORLD-OVERVIEW")).toBeInTheDocument();
    expect(screen.getByText("세계 개요 내용")).toBeInTheDocument();
  });

  it("모달에서 다음 카테고리로 이동할 수 있다", async () => {
    const user = userEvent.setup();
    render(<LorePageClient contents={mockContents} />);

    // 세계 개요 카드 클릭
    await user.click(screen.getByText("WORLD-OVERVIEW"));
    expect(screen.getByText("SECTION::WORLD-OVERVIEW")).toBeInTheDocument();

    // 다음 카테고리로 이동
    await user.click(screen.getByText("사회 구조 →"));
    expect(screen.getByText("SECTION::CIVIC-STRUCTURE")).toBeInTheDocument();
    expect(screen.getByText("사회 구조 내용")).toBeInTheDocument();
  });

  it("INCIDENT LOG 탭 클릭 시 준비 중 메시지가 표시된다", async () => {
    const user = userEvent.setup();
    render(<LorePageClient contents={mockContents} />);

    const tab = screen.getByText("INCIDENT LOG", { exact: false });
    await user.click(tab);

    expect(screen.getByText("시즌 기록은 추후 공개됩니다")).toBeInTheDocument();
  });

  it("하단 상태 바에 파일 수를 표시한다", () => {
    render(<LorePageClient contents={mockContents} />);
    expect(screen.getByText("6 FILES INDEXED")).toBeInTheDocument();
  });
});
