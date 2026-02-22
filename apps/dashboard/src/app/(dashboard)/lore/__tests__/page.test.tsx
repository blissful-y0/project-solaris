import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LorePageClient } from "@/components/lore";
import type { LoreDocumentHtml } from "@/components/lore";

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
  makeDoc("overview", "<h2>세계 개요</h2><p>2174년 솔라리스</p>", "세계 개요", 0),
  makeDoc("society", "<p>사회 구조 내용</p>", "사회 구조", 1),
  makeDoc("resonance", "<p>공명율 내용</p>", "공명율과 능력체계", 2),
  makeDoc("abilities", "<p>능력 분류 내용</p>", "능력 분류", 3),
  makeDoc("factions", "<p>대립 구도 내용</p>", "대립 구도", 4),
  makeDoc("battle-rules", "<p>배틀룰 내용</p>", "전투 규칙", 5),
];

describe("WorldPage (LorePageClient)", () => {
  it("LORE ARCHIVE 타이틀을 렌더링한다", () => {
    render(<LorePageClient contents={mockContents} />);
    expect(screen.getByText("HELIOS ARCHIVE v2.1")).toBeInTheDocument();
  });

  it("카테고리들을 모두 표시한다", () => {
    render(<LorePageClient contents={mockContents} />);
    expect(screen.getByText("OVERVIEW")).toBeInTheDocument();
    expect(screen.getByText("SOCIETY")).toBeInTheDocument();
    expect(screen.getByText("RESONANCE")).toBeInTheDocument();
    expect(screen.getByText("ABILITIES")).toBeInTheDocument();
    expect(screen.getByText("FACTIONS")).toBeInTheDocument();
    expect(screen.getByText("BATTLE-RULES")).toBeInTheDocument();
  });
});
