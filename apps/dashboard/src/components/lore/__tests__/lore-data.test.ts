import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockReadFile } = vi.hoisted(() => ({
  mockReadFile: vi.fn(),
}));

vi.mock("node:fs/promises", () => ({
  default: {
    readFile: mockReadFile,
  },
}));

describe("lore-data", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("markdown HTML 변환 시 script 태그를 제거한다", async () => {
    mockReadFile.mockResolvedValue("# 제목\n\n<script>alert('xss')</script>\n본문");
    const { loadAllLoreContents } = await import("../lore-data");

    const result = await loadAllLoreContents();
    expect(result[0]?.html).not.toContain("<script>");
  });

  it("파일 읽기 실패 시 빈 콘텐츠로 graceful fallback 한다", async () => {
    mockReadFile.mockRejectedValue(new Error("ENOENT"));
    const { loadAllLoreContents } = await import("../lore-data");

    const result = await loadAllLoreContents();
    expect(result).toHaveLength(6);
    expect(result.every((item) => item.html === "")).toBe(true);
  });
});
