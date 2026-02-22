// src/components/lore/__tests__/lore-data.test.ts
import { describe, expect, it } from "vitest";
import { markdownToHtml, replaceRedactedMarkers } from "../lore-data";

describe("replaceRedactedMarkers", () => {
  it("[REDACTED]를 검열 HTML span으로 치환한다", () => {
    const html = "<p>정보: [REDACTED] 위치</p>";
    const result = replaceRedactedMarkers(html);
    expect(result).toContain("■■■■");
    expect(result).toContain("CLASSIFIED");
    expect(result).not.toContain("[REDACTED]");
  });
});

describe("markdownToHtml", () => {
  it("마크다운을 HTML로 변환한다", async () => {
    const result = await markdownToHtml("# 제목\n\n내용");
    expect(result).toContain("<h1>");
    expect(result).toContain("제목");
  });

  it("AI GM 지시(> [!NOTE] 등)를 제거한다", async () => {
    const md = "> [!NOTE]\n> AI 전용 지시사항\n\n일반 내용";
    const result = await markdownToHtml(md);
    expect(result).not.toContain("AI 전용 지시사항");
    expect(result).toContain("일반 내용");
  });

  it("[REDACTED]를 검열 span으로 변환한다", async () => {
    const result = await markdownToHtml("기밀: [REDACTED]");
    expect(result).toContain("■■■■");
  });
});
