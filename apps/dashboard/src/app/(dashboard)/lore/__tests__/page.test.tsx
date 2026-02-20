import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LorePageClient } from "@/components/lore";
import type { LoreCategoryContent } from "@/components/lore";

const mockContents: LoreCategoryContent[] = [
  { id: "overview", html: "<h2>세계 개요</h2><p>2174년 솔라리스</p>" },
  { id: "society", html: "<p>사회 구조 내용</p>" },
  { id: "resonance", html: "<p>공명율 내용</p>" },
  { id: "abilities", html: "<p>능력 분류 내용</p>" },
  { id: "factions", html: "<p>대립 구도 내용</p>" },
  { id: "battle-rules", html: "<p>배틀룰 내용</p>" },
];

describe("WorldPage (LorePageClient)", () => {
  it("LORE ARCHIVE 타이틀을 렌더링한다", () => {
    render(<LorePageClient contents={mockContents} />);
    expect(screen.getByText("HELIOS ARCHIVE v2.1")).toBeInTheDocument();
  });

  it("카테고리들을 모두 표시한다", () => {
    render(<LorePageClient contents={mockContents} />);
    expect(screen.getByText("WORLD-OVERVIEW")).toBeInTheDocument();
    expect(screen.getByText("CIVIC-STRUCTURE")).toBeInTheDocument();
    expect(screen.getByText("RESONANCE-PROTOCOL")).toBeInTheDocument();
    expect(screen.getByText("ABILITY-REGISTRY")).toBeInTheDocument();
    expect(screen.getByText("FACTION-INTEL")).toBeInTheDocument();
    expect(screen.getByText("COMBAT-DOCTRINE")).toBeInTheDocument();
  });
});
