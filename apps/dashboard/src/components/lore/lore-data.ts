// src/components/lore/lore-data.ts
import { remark } from "remark";
import remarkHtml from "remark-html";

import type { LoreDocumentHtml, LoreDocumentMeta } from "./types";

/** [REDACTED] 마커를 검열 HTML span으로 치환 */
export function replaceRedactedMarkers(html: string): string {
  return html.replace(
    /\[REDACTED\]/g,
    '<span class="bg-current text-transparent select-none rounded-sm px-1" aria-label="검열된 정보" title="CLASSIFIED">■■■■</span>',
  );
}

/** 마크다운 → HTML 변환 */
export async function markdownToHtml(markdown: string): Promise<string> {
  // > [!NOTE], > [!TIP], > [!WARNING] 제거 — AI GM 지침이므로 유저에게 비노출
  const cleaned = markdown.replace(
    /^> \[!(NOTE|TIP|WARNING)\]\n(> .*\n?)*/gm,
    "",
  );
  const result = await remark().use(remarkHtml, { sanitize: true }).process(cleaned);
  return replaceRedactedMarkers(String(result));
}

/** DB에서 모든 Lore 문서를 로드하고 HTML로 변환 (서버 컴포넌트용) */
export async function loadAllLoreContents(): Promise<LoreDocumentHtml[]> {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("lore_documents")
    .select("id, title, slug, content, clearance_level, order_index, created_at, updated_at")
    .is("deleted_at", null)
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  const results = await Promise.all(
    data.map(async (row) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      clearanceLevel: row.clearance_level as 1 | 2 | 3,
      orderIndex: row.order_index,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      html: await markdownToHtml(row.content),
    })),
  );

  return results;
}

/** slug로 단일 문서 로드 (서버 컴포넌트용) */
export async function loadLoreDocumentBySlug(slug: string): Promise<LoreDocumentHtml | null> {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("lore_documents")
    .select("id, title, slug, content, clearance_level, order_index, created_at, updated_at")
    .eq("slug", slug)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    clearanceLevel: data.clearance_level as 1 | 2 | 3,
    orderIndex: data.order_index,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    html: await markdownToHtml(data.content),
  };
}

/** 목록용 메타데이터만 조회 (content 제외) */
export async function loadLoreDocumentsMeta(): Promise<LoreDocumentMeta[]> {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("lore_documents")
    .select("id, title, slug, clearance_level, order_index, created_at, updated_at")
    .is("deleted_at", null)
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    clearanceLevel: row.clearance_level as 1 | 2 | 3,
    orderIndex: row.order_index,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}
