import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { LorePageClient } from "../LorePageClient";
import type { LoreDocumentHtml } from "../types";

const makeDoc = (slug: string, html: string, title: string, i: number): LoreDocumentHtml => ({
  id: `mock-uuid-${i}`,
  title,
  slug,
  clearanceLevel: 1,
  orderIndex: i,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  html,
});

const mockContents: LoreDocumentHtml[] = [
  makeDoc("overview", "<p>세계 개요 내용</p>", "세계 개요", 0),
  makeDoc("society", "<p>사회 구조 내용</p>", "사회 구조", 1),
  makeDoc("resonance", "<p>공명율 내용</p>", "공명율과 능력체계", 2),
  makeDoc("abilities", "<p>능력 분류 내용</p>", "능력 분류", 3),
  makeDoc("factions", "<p>대립 구도 내용</p>", "대립 구도", 4),
  makeDoc("battle-rules", "<p>배틀룰 내용</p>", "전투 규칙", 5),
];

describe("LorePageClient", () => {
  it("페이지 타이틀과 터미널 UI를 렌더링한다", () => {
    render(<LorePageClient contents={mockContents} />);
    expect(screen.getByText("HELIOS ARCHIVE v2.1")).toBeInTheDocument();
    expect(screen.getByText("DATABASE", { exact: false })).toBeInTheDocument();
  });

  it("데이터베이스 탭에 문서 제목이 표시된다", () => {
    render(<LorePageClient contents={mockContents} />);
    expect(screen.getByText("세계 개요")).toBeInTheDocument();
  });

  it("카드를 클릭하면 모달이 열리고 내용이 렌더링된다", async () => {
    const user = userEvent.setup();
    render(<LorePageClient contents={mockContents} />);

    // 제목으로 카드 식별 후 클릭
    const card = screen.getByText("세계 개요");
    await user.click(card);

    expect(screen.getByText("/helios/archive/overview.doc")).toBeInTheDocument();
    expect(screen.getByText("FILE_001 / overview")).toBeInTheDocument();
    expect(screen.getByText("세계 개요 내용")).toBeInTheDocument();
  });

  it("모달에서 다음 카테고리로 이동할 수 있다", async () => {
    const user = userEvent.setup();
    render(<LorePageClient contents={mockContents} />);

    // 세계 개요 카드 클릭
    await user.click(screen.getByText("세계 개요"));
    expect(screen.getByText("FILE_001 / overview")).toBeInTheDocument();

    // 다음 카테고리로 이동
    await user.click(screen.getByText("사회 구조 →"));
    expect(screen.getByText("FILE_002 / society")).toBeInTheDocument();
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
