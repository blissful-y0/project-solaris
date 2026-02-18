import fs from "node:fs/promises";
import path from "node:path";
import { remark } from "remark";
import remarkHtml from "remark-html";

import type { LoreCategoryContent, LoreCategoryId } from "./types";

/** 프로젝트 루트의 docs/lore 경로 */
const LORE_DIR = path.join(process.cwd(), "../../docs/lore");

/** 카테고리 → 파일 매핑 */
const CATEGORY_FILE_MAP: Record<LoreCategoryId, string> = {
  overview: "world-overview.md",
  society: "society.md",
  resonance: "resonance-and-powers.md",
  abilities: "combat-system.md",
  factions: "factions.md",
  "battle-rules": "combat-system.md",
};

/** 능력분류: 전투 시스템에서 능력 관련 섹션만 추출 */
const ABILITIES_SECTIONS = [
  "## 능력 유형별 특성",
  "## 스탯 구조",
  "## 능력 운용 규칙",
];

/** 배틀룰: 전투 시스템에서 전투 규칙 섹션만 추출 */
const BATTLE_SECTIONS = [
  "## 전투 철학",
  "## 판정 엔진",
  "## 전투 흐름",
  "## 특수 상황 규칙",
  "## 집단전과 부상",
  "## 교전 샘플",
];

/** 마크다운 파일 읽기 */
async function readMarkdownFile(filename: string): Promise<string> {
  const filePath = path.join(LORE_DIR, filename);
  return fs.readFile(filePath, "utf-8");
}

/** 특정 ## 섹션들만 추출 */
function extractSections(markdown: string, sectionHeaders: string[]): string {
  const lines = markdown.split("\n");
  const extracted: string[] = [];
  let capturing = false;

  for (const line of lines) {
    /* ## 레벨 헤딩 감지 */
    if (line.startsWith("## ")) {
      capturing = sectionHeaders.some((h) => line.startsWith(h));
    }
    if (capturing) {
      extracted.push(line);
    }
  }

  return extracted.join("\n");
}

/** [REDACTED] 마커를 RedactedBlock HTML로 치환 */
export function replaceRedactedMarkers(html: string): string {
  return html.replace(
    /\[REDACTED\]/g,
    '<span class="bg-current text-transparent select-none rounded-sm px-1" aria-label="검열된 정보" title="CLASSIFIED">■■■■</span>',
  );
}

/** 마크다운 → HTML 변환 */
async function markdownToHtml(markdown: string): Promise<string> {
  /* > [!NOTE], > [!TIP], > [!WARNING] 제거 — AI GM 지침이므로 유저에게 비노출 */
  const cleaned = markdown.replace(
    /^> \[!(NOTE|TIP|WARNING)\]\n(> .*\n?)*/gm,
    "",
  );

  const result = await remark().use(remarkHtml).process(cleaned);
  return replaceRedactedMarkers(String(result));
}

/** 카테고리 ID에 맞는 HTML 콘텐츠 생성 */
async function loadCategoryContent(
  id: LoreCategoryId,
): Promise<string> {
  const filename = CATEGORY_FILE_MAP[id];
  const raw = await readMarkdownFile(filename);

  let markdown: string;
  if (id === "abilities") {
    markdown = extractSections(raw, ABILITIES_SECTIONS);
  } else if (id === "battle-rules") {
    markdown = extractSections(raw, BATTLE_SECTIONS);
  } else {
    markdown = raw;
  }

  return markdownToHtml(markdown);
}

/** 모든 카테고리 콘텐츠를 병렬로 로드 */
export async function loadAllLoreContents(): Promise<LoreCategoryContent[]> {
  const ids: LoreCategoryId[] = [
    "overview",
    "society",
    "resonance",
    "abilities",
    "factions",
    "battle-rules",
  ];

  const results = await Promise.all(
    ids.map(async (id) => ({
      id,
      html: await loadCategoryContent(id),
    })),
  );

  return results;
}
