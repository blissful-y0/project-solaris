import { describe, expect, it } from "vitest";

import { replaceRedactedMarkers } from "../lore-data";

describe("replaceRedactedMarkers", () => {
  it("[REDACTED] 텍스트를 RedactedBlock HTML로 치환한다", () => {
    const input = "<p>헬리오스의 [REDACTED] 목적은 알 수 없다.</p>";
    const result = replaceRedactedMarkers(input);
    expect(result).toContain('aria-label="검열된 정보"');
    expect(result).toContain("CLASSIFIED");
    expect(result).not.toContain("[REDACTED]");
  });

  it("여러 개의 [REDACTED]를 모두 치환한다", () => {
    const input = "<p>[REDACTED] 그리고 [REDACTED]</p>";
    const result = replaceRedactedMarkers(input);
    const matches = result.match(/aria-label="검열된 정보"/g);
    expect(matches).toHaveLength(2);
  });

  it("[REDACTED]가 없으면 원본 그대로 반환한다", () => {
    const input = "<p>일반 텍스트</p>";
    const result = replaceRedactedMarkers(input);
    expect(result).toBe(input);
  });
});
