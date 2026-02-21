# Lore Admin CMS 구현 계획

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 파일시스템 기반(6개 고정 카테고리)인 Lore 시스템을 DB 기반 동적 CMS로 교체하고, 어드민이 마크다운을 업로드/편집하면 Lore 페이지에 즉시 반영되도록 한다.

**Architecture:** `lore_documents` 테이블에 마크다운 content를 text로 저장. 서버 컴포넌트는 Supabase 서버 클라이언트로 직접 조회, 어드민 UI는 `/api/admin/lore` REST API로 CRUD 수행. 기존 `[REDACTED]` 처리·AI GM 지시 stripping 로직은 그대로 재사용.

**Tech Stack:** Next.js 15 App Router, Supabase PostgreSQL, `@supabase/ssr`, remark/remark-html (기존), Tailwind CSS v4, Vitest

**Worktree:** `.worktrees/lore-admin-cms` (브랜치: `feat/lore-admin-cms`, develop 기반)

---

## 사전 확인

- 기존 테스트: 612 통과 / 14 pre-existing 실패 (LoginPage 13 + StepConfirm 1 — 기존 이슈)
- 모든 신규 실패는 pre-existing 14건 외 추가 실패가 없어야 한다.
- `requireAdmin()`: `src/lib/admin-guard.ts` — 기존 admin guard 패턴 그대로 사용

---

## Task 1: DB 마이그레이션

**Files:**
- Create: `apps/dashboard/supabase/migrations/013_create_lore_documents.sql`

**Step 1: 마이그레이션 파일 작성**

```sql
-- 013_create_lore_documents.sql
-- 목적: Lore CMS DB 기반 전환 — 기존 파일시스템 카테고리를 lore_documents 테이블로 대체

CREATE TABLE IF NOT EXISTS lore_documents (
  id              text PRIMARY KEY,
  title           text NOT NULL,
  slug            text NOT NULL,
  content         text NOT NULL DEFAULT '',
  clearance_level integer NOT NULL DEFAULT 1
    CHECK (clearance_level IN (1, 2, 3)),
  order_index     integer NOT NULL DEFAULT 0,
  deleted_at      timestamptz NULL,
  created_at      timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at      timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_lore_documents_slug
  ON lore_documents(slug)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_lore_documents_order
  ON lore_documents(order_index, created_at)
  WHERE deleted_at IS NULL;

-- updated_at 자동 갱신
DROP TRIGGER IF EXISTS trg_lore_documents_updated_at ON lore_documents;
CREATE TRIGGER trg_lore_documents_updated_at
  BEFORE UPDATE ON lore_documents
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS
ALTER TABLE lore_documents ENABLE ROW LEVEL SECURITY;

-- 인증된 유저 전체 조회 허용 (클리어런스 필터는 앱 레이어에서)
CREATE POLICY "lore_documents_select_authenticated"
  ON lore_documents FOR SELECT TO authenticated
  USING (deleted_at IS NULL);

-- 어드민만 INSERT/UPDATE/DELETE
CREATE POLICY "lore_documents_insert_admin"
  ON lore_documents FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin' AND u.deleted_at IS NULL)
  );

CREATE POLICY "lore_documents_update_admin"
  ON lore_documents FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin' AND u.deleted_at IS NULL)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin' AND u.deleted_at IS NULL)
  );

CREATE POLICY "lore_documents_delete_admin"
  ON lore_documents FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin' AND u.deleted_at IS NULL)
  );
```

**Step 2: Supabase CLI로 적용**

```bash
cd apps/dashboard
npx supabase db push
# 또는 로컬 supabase 사용 중이면:
npx supabase migration up
```

Expected: 에러 없이 적용 완료

**Step 3: 커밋**

```bash
git add supabase/migrations/013_create_lore_documents.sql
git commit -m "feat(lore): lore_documents DB 마이그레이션 추가"
```

---

## Task 2: 타입 및 로딩 함수 교체

**Files:**
- Modify: `apps/dashboard/src/components/lore/types.ts`
- Modify: `apps/dashboard/src/components/lore/lore-data.ts`
- Modify: `apps/dashboard/src/components/lore/index.ts`
- Modify: `apps/dashboard/src/components/lore/__tests__/lore-data.test.ts`

**Step 1: 테스트 먼저 작성 (lore-data.test.ts 교체)**

기존 `lore-data.test.ts`는 파일시스템 mock을 사용한다. DB 기반으로 교체한다.

```ts
// src/components/lore/__tests__/lore-data.test.ts
import { describe, expect, it, vi, beforeEach } from "vitest";
import { markdownToHtml, replaceRedactedMarkers } from "../lore-data";

// markdownToHtml, replaceRedactedMarkers는 그대로 재사용
// loadAllLoreContents는 Supabase 서버 클라이언트를 쓰므로 통합 테스트로 분리
// 여기서는 순수 변환 함수만 테스트

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
```

**Step 2: 테스트 실행 확인 (PASS 확인)**

```bash
cd apps/dashboard
npx vitest run src/components/lore/__tests__/lore-data.test.ts
```

Expected: 기존 테스트가 수정 전에도 동작하는지 확인 (일부 실패할 수 있음 — 다음 스텝에서 수정)

**Step 3: types.ts에 LoreDocument 타입 추가**

```ts
// types.ts 기존 내용 유지하고 아래 추가

/** DB 기반 Lore 문서 */
export type LoreDocument = {
  id: string;
  title: string;
  slug: string;
  content: string;  // 마크다운 원문
  clearanceLevel: ClearanceLevel;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
};

/** 목록용 (content 제외) */
export type LoreDocumentMeta = Omit<LoreDocument, "content">;

/** HTML로 렌더링된 문서 (Lore 페이지 렌더링용) */
export type LoreDocumentHtml = LoreDocumentMeta & { html: string };
```

**Step 4: lore-data.ts 교체**

기존 파일시스템 로딩 함수(`loadAllLoreContents`, `loadCategoryContent` 등)를 제거하고 DB 기반으로 교체. `markdownToHtml`, `replaceRedactedMarkers`는 유지.

```ts
// src/components/lore/lore-data.ts
import { remark } from "remark";
import remarkHtml from "remark-html";

import { createClient } from "@/lib/supabase/server";
import type { LoreDocumentHtml, LoreDocumentMeta } from "./types";

/** [REDACTED] 마커를 검열 HTML span으로 치환 */
export function replaceRedactedMarkers(html: string): string {
  return html.replace(
    /\[REDACTED\]/g,
    '<span class="bg-current text-transparent select-none rounded-sm px-1" aria-label="검열된 정보" title="CLASSIFIED">■■■■</span>',
  );
}

/** 마크다운 → HTML 변환 (export하여 테스트 가능하게) */
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
```

**Step 5: index.ts 업데이트**

```ts
// src/components/lore/index.ts
export { ClearanceBadge } from "./ClearanceBadge";
export { LoreArchiveCard } from "./LoreArchiveCard";
export { LoreContent } from "./LoreContent";
export { LoreCTA } from "./LoreCTA";
export { LoreDetailModal } from "./LoreDetailModal";
export { LorePageClient } from "./LorePageClient";
export {
  loadAllLoreContents,
  loadLoreDocumentBySlug,
  loadLoreDocumentsMeta,
  replaceRedactedMarkers,
  markdownToHtml,
} from "./lore-data";
export type {
  LoreCategoryId,
  LoreCategory,
  LoreCategoryContent,
  ClearanceLevel,
  LoreDocument,
  LoreDocumentMeta,
  LoreDocumentHtml,
} from "./types";
export { LORE_CATEGORIES, CLEARANCE_CONFIG } from "./types";
```

**Step 6: 테스트 실행**

```bash
cd apps/dashboard
npx vitest run src/components/lore/
```

Expected: lore-data 테스트 PASS, replaceRedacted 테스트 PASS

**Step 7: 커밋**

```bash
git add src/components/lore/
git commit -m "feat(lore): DB 기반 lore-data 로더로 교체 — 파일시스템 의존성 제거"
```

---

## Task 3: LorePageClient 동적 사이드바 적용

**Files:**
- Glob: `apps/dashboard/src/components/lore/LorePageClient.tsx` 읽기
- Modify: LorePageClient.tsx — `LORE_CATEGORIES` 하드코딩 → `props.documents` 기반으로 교체
- Modify: `apps/dashboard/src/app/(dashboard)/lore/page.tsx`

**Step 1: LorePageClient.tsx 읽기**

```bash
cat src/components/lore/LorePageClient.tsx
```

현재 사이드바가 `LORE_CATEGORIES` 배열을 사용하는지 확인.

**Step 2: page.tsx 업데이트**

```tsx
// src/app/(dashboard)/lore/page.tsx
import { Suspense } from "react";
import { loadAllLoreContents, LorePageClient } from "@/components/lore";

export default async function WorldPage() {
  const contents = await loadAllLoreContents();

  return (
    <Suspense>
      <LorePageClient contents={contents} />
    </Suspense>
  );
}
```

`contents`의 타입이 `LoreDocumentHtml[]`로 바뀌므로 LorePageClient props 타입도 맞춰야 한다. LorePageClient 읽은 후 props 타입 수정 필요.

**Step 3: LorePageClient props 타입 수정**

`LorePageClient`가 현재 `LoreCategoryContent[]`를 받는다면, `LoreDocumentHtml[]`을 받도록 수정. 사이드바는 `contents.map(d => d.title)`로 동적 렌더링.

타입 변경 포인트:
- `contents: LoreCategoryContent[]` → `contents: LoreDocumentHtml[]`
- 사이드바: `LORE_CATEGORIES` → `contents.map(d => ({ id: d.slug, label: d.title, clearanceLevel: d.clearanceLevel }))`
- 컨텐츠 패널: `content.id === selected` → `content.slug === selected`

**Step 4: 빌드 확인**

```bash
cd apps/dashboard
npx tsc --noEmit 2>&1 | head -30
```

**Step 5: 테스트 실행**

```bash
npx vitest run src/app/\(dashboard\)/lore/
```

**Step 6: 커밋**

```bash
git add src/app/\(dashboard\)/lore/ src/components/lore/LorePageClient.tsx
git commit -m "feat(lore): Lore 페이지 동적 문서 목록 적용 — LORE_CATEGORIES 하드코딩 제거"
```

---

## Task 4: 어드민 API 라우트

**Files:**
- Create: `apps/dashboard/src/app/api/admin/lore/route.ts`
- Create: `apps/dashboard/src/app/api/admin/lore/[id]/route.ts`
- Create: `apps/dashboard/src/app/api/admin/lore/__tests__/route.test.ts`

**Step 1: 테스트 먼저 작성**

```ts
// src/app/api/admin/lore/__tests__/route.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

// requireAdmin mock
vi.mock("@/lib/admin-guard", () => ({
  requireAdmin: vi.fn(),
}));

import { requireAdmin } from "@/lib/admin-guard";
import { GET, POST } from "../route";
import { PUT, DELETE } from "../[id]/route";
import { NextRequest } from "next/server";

const mockSupabase = {
  from: vi.fn(),
};

const makeChain = (result: object) => ({
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  is: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue(result),
  maybeSingle: vi.fn().mockResolvedValue(result),
});

beforeEach(() => {
  vi.clearAllMocks();
  (requireAdmin as ReturnType<typeof vi.fn>).mockResolvedValue({ supabase: mockSupabase });
});

describe("GET /api/admin/lore", () => {
  it("인증 실패 시 401 반환", async () => {
    (requireAdmin as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("UNAUTHENTICATED"));
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("어드민 권한 없으면 403 반환", async () => {
    (requireAdmin as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("FORBIDDEN"));
    const res = await GET();
    expect(res.status).toBe(403);
  });

  it("문서 목록 반환", async () => {
    const chain = makeChain(undefined);
    chain.order = vi.fn().mockReturnThis();
    // 최종 resolve를 data로
    const finalResult = { data: [{ id: "doc1", title: "제목", slug: "title", clearance_level: 1, order_index: 0 }], error: null };
    chain.order.mockResolvedValueOnce(finalResult);
    mockSupabase.from.mockReturnValue(chain);

    const res = await GET();
    expect(res.status).toBe(200);
  });
});

describe("POST /api/admin/lore", () => {
  it("title 없으면 400 반환", async () => {
    const req = new NextRequest("http://localhost/api/admin/lore", {
      method: "POST",
      body: JSON.stringify({ slug: "test" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
```

**Step 2: 테스트 실행 (FAIL 확인)**

```bash
npx vitest run src/app/api/admin/lore/
```

Expected: 파일 없으므로 모듈 not found 에러

**Step 3: GET + POST 라우트 구현**

```ts
// src/app/api/admin/lore/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";

/** GET /api/admin/lore — 전체 문서 목록 (어드민) */
export async function GET() {
  try {
    const { supabase } = await requireAdmin();

    const { data, error } = await supabase
      .from("lore_documents")
      .select("id, title, slug, clearance_level, order_index, created_at, updated_at")
      .is("deleted_at", null)
      .order("order_index", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: "FAILED_TO_FETCH" }, { status: 500 });
    }

    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}

/** POST /api/admin/lore — 신규 문서 생성 */
export async function POST(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin();

    const body = await request.json().catch(() => null);
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const slug = typeof body?.slug === "string" ? body.slug.trim() : "";
    const content = typeof body?.content === "string" ? body.content : "";
    const clearanceLevel = [1, 2, 3].includes(body?.clearanceLevel) ? body.clearanceLevel as 1|2|3 : 1;
    const orderIndex = typeof body?.orderIndex === "number" ? body.orderIndex : 0;

    if (!title || !slug) {
      return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("lore_documents")
      .insert({
        id: `lore_${crypto.randomUUID()}`,
        title,
        slug,
        content,
        clearance_level: clearanceLevel,
        order_index: orderIndex,
      })
      .select("id, title, slug, clearance_level, order_index, created_at, updated_at")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "SLUG_CONFLICT" }, { status: 409 });
      }
      return NextResponse.json({ error: "FAILED_TO_CREATE" }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
```

**Step 4: PUT + DELETE 라우트 구현**

```ts
// src/app/api/admin/lore/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";

/** PUT /api/admin/lore/[id] — 문서 수정 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { supabase } = await requireAdmin();

    const body = await request.json().catch(() => null);

    const updates: Record<string, unknown> = {};
    if (typeof body?.title === "string" && body.title.trim()) {
      updates.title = body.title.trim();
    }
    if (typeof body?.slug === "string" && body.slug.trim()) {
      updates.slug = body.slug.trim();
    }
    if (typeof body?.content === "string") {
      updates.content = body.content;
    }
    if ([1, 2, 3].includes(body?.clearanceLevel)) {
      updates.clearance_level = body.clearanceLevel;
    }
    if (typeof body?.orderIndex === "number") {
      updates.order_index = body.orderIndex;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("lore_documents")
      .update(updates)
      .eq("id", id)
      .is("deleted_at", null)
      .select("id, title, slug, clearance_level, order_index, created_at, updated_at")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "SLUG_CONFLICT" }, { status: 409 });
      }
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
      }
      return NextResponse.json({ error: "FAILED_TO_UPDATE" }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}

/** DELETE /api/admin/lore/[id] — 문서 soft delete */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { supabase } = await requireAdmin();

    const { error } = await supabase
      .from("lore_documents")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .is("deleted_at", null);

    if (error) {
      return NextResponse.json({ error: "FAILED_TO_DELETE" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
```

**Step 5: 테스트 실행 (PASS 확인)**

```bash
npx vitest run src/app/api/admin/lore/
```

Expected: PASS

**Step 6: 커밋**

```bash
git add src/app/api/admin/lore/
git commit -m "feat(lore): 어드민 Lore CRUD API 라우트 추가"
```

---

## Task 5: 어드민 Lore 관리 UI

**Files:**
- Create: `apps/dashboard/src/app/(admin)/admin/lore/page.tsx`
- Create: `apps/dashboard/src/app/(admin)/admin/lore/__tests__/page.test.tsx`
- Modify: `apps/dashboard/src/app/(admin)/admin/page.tsx` (빠른 이동에 Lore 링크 추가)

**Step 1: 테스트 먼저 작성**

```tsx
// src/app/(admin)/admin/lore/__tests__/page.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

global.fetch = vi.fn();

describe("AdminLorePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("로딩 중 텍스트를 표시한다", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: [] }),
    });

    const { default: AdminLorePage } = await import("../page");
    render(<AdminLorePage />);
    expect(screen.getByText(/불러오는 중/i)).toBeTruthy();
  });

  it("문서 목록을 렌더링한다", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: [
          { id: "1", title: "세계 개요", slug: "world-overview", clearance_level: 1, order_index: 0 },
        ],
      }),
    });

    const { default: AdminLorePage } = await import("../page");
    render(<AdminLorePage />);

    await waitFor(() => {
      expect(screen.getByText("세계 개요")).toBeTruthy();
    });
  });

  it("[+ 새 문서] 버튼이 있다", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: [] }),
    });

    const { default: AdminLorePage } = await import("../page");
    render(<AdminLorePage />);

    await waitFor(() => {
      expect(screen.getByText("새 문서")).toBeTruthy();
    });
  });
});
```

**Step 2: 테스트 실행 (FAIL 확인)**

```bash
npx vitest run src/app/\(admin\)/admin/lore/
```

**Step 3: AdminLorePage 구현**

핵심 구조:
- 목록: `GET /api/admin/lore` 조회 → 카드 리스트
- [새 문서] 버튼 → Modal 열림
- 각 문서 행: 편집 버튼 → Modal(편집), 삭제 버튼 → `DELETE /api/admin/lore/[id]`
- Modal: 제목/슬러그/클리어런스/내용 탭(파일 업로드 | 직접 편집)

```tsx
// src/app/(admin)/admin/lore/page.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Card, Badge, Modal } from "@/components/ui";
import { CLEARANCE_CONFIG } from "@/components/lore";
import type { ClearanceLevel } from "@/components/lore";

type DocMeta = {
  id: string;
  title: string;
  slug: string;
  clearance_level: ClearanceLevel;
  order_index: number;
};

type ModalMode = "create" | "edit";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AdminLorePage() {
  const [docs, setDocs] = useState<DocMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [editTarget, setEditTarget] = useState<DocMeta | null>(null);

  // 폼 상태
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [clearance, setClearance] = useState<ClearanceLevel>(1);
  const [contentTab, setContentTab] = useState<"upload" | "editor">("editor");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDocs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/lore");
      if (!res.ok) { setDocs([]); return; }
      const body = await res.json() as { data?: DocMeta[] };
      setDocs(body.data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadDocs(); }, [loadDocs]);

  const openCreate = () => {
    setModalMode("create");
    setEditTarget(null);
    setTitle(""); setSlug(""); setClearance(1); setContent(""); setError("");
    setModalOpen(true);
  };

  const openEdit = (doc: DocMeta) => {
    setModalMode("edit");
    setEditTarget(doc);
    setTitle(doc.title); setSlug(doc.slug); setClearance(doc.clearance_level); setContent(""); setError("");
    setModalOpen(true);
  };

  const handleTitleChange = (v: string) => {
    setTitle(v);
    if (modalMode === "create") setSlug(slugify(v));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setContent(text);
    setContentTab("editor");
  };

  const handleSubmit = async () => {
    if (!title.trim() || !slug.trim()) { setError("제목과 슬러그는 필수입니다."); return; }
    setSubmitting(true);
    setError("");
    try {
      const url = modalMode === "create" ? "/api/admin/lore" : `/api/admin/lore/${editTarget!.id}`;
      const method = modalMode === "create" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), slug: slug.trim(), content, clearanceLevel: clearance }),
      });
      if (res.status === 409) { setError("슬러그가 이미 사용 중입니다."); return; }
      if (!res.ok) { setError("저장에 실패했습니다."); return; }
      setModalOpen(false);
      await loadDocs();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("이 문서를 삭제하시겠습니까?")) return;
    await fetch(`/api/admin/lore/${id}`, { method: "DELETE" });
    await loadDocs();
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="hud-label mb-1">LORE DOCUMENTS</p>
        </div>
        <Button size="sm" onClick={openCreate}>새 문서</Button>
      </div>

      <Card hud>
        {loading ? (
          <p className="text-sm text-text-secondary py-4 text-center">불러오는 중...</p>
        ) : docs.length === 0 ? (
          <p className="text-sm text-text-secondary py-4 text-center">등록된 문서가 없습니다.</p>
        ) : (
          <ul className="divide-y divide-border">
            {docs.map((doc) => {
              const cfg = CLEARANCE_CONFIG[doc.clearance_level];
              return (
                <li key={doc.id} className="flex items-center gap-3 py-3 px-2">
                  <span className="text-text-secondary text-xs w-4 shrink-0">≡</span>
                  <span className="flex-1 text-sm text-text truncate">{doc.title}</span>
                  <span className={`text-xs font-mono ${cfg.textColor}`}>{cfg.label}</span>
                  <Button size="sm" variant="ghost" onClick={() => openEdit(doc)}>편집</Button>
                  <Button size="sm" variant="ghost" onClick={() => void handleDelete(doc.id)}>삭제</Button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalMode === "create" ? "새 문서" : "문서 편집"}
      >
        <div className="space-y-4">
          {error && <p className="text-xs text-accent">{error}</p>}

          <div>
            <label className="block text-xs text-text-secondary mb-1">제목</label>
            <input
              className="w-full bg-surface border border-border rounded px-3 py-2 text-sm text-text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="문서 제목"
            />
          </div>

          <div>
            <label className="block text-xs text-text-secondary mb-1">슬러그</label>
            <input
              className="w-full bg-surface border border-border rounded px-3 py-2 text-sm text-text font-mono"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="url-slug"
            />
          </div>

          <div>
            <label className="block text-xs text-text-secondary mb-2">클리어런스</label>
            <div className="flex gap-2">
              {([1, 2, 3] as ClearanceLevel[]).map((lv) => (
                <button
                  key={lv}
                  type="button"
                  onClick={() => setClearance(lv)}
                  className={`px-3 py-1 text-xs rounded border transition-colors ${
                    clearance === lv
                      ? `${CLEARANCE_CONFIG[lv].textColor} border-current`
                      : "text-text-secondary border-border"
                  }`}
                >
                  {CLEARANCE_CONFIG[lv].label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setContentTab("upload")}
                className={`text-xs px-3 py-1 rounded border ${contentTab === "upload" ? "text-primary border-primary" : "text-text-secondary border-border"}`}
              >
                파일 업로드
              </button>
              <button
                type="button"
                onClick={() => setContentTab("editor")}
                className={`text-xs px-3 py-1 rounded border ${contentTab === "editor" ? "text-primary border-primary" : "text-text-secondary border-border"}`}
              >
                직접 편집
              </button>
            </div>
            {contentTab === "upload" ? (
              <div
                className="border-2 border-dashed border-border rounded p-6 text-center cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <p className="text-xs text-text-secondary">.md 파일을 클릭하여 선택</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".md,text/markdown"
                  className="hidden"
                  onChange={(e) => void handleFileUpload(e)}
                />
              </div>
            ) : (
              <textarea
                className="w-full bg-surface border border-border rounded px-3 py-2 text-sm text-text font-mono h-48 resize-y"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="마크다운 내용을 입력하세요..."
              />
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>취소</Button>
            <Button size="sm" onClick={() => void handleSubmit()} disabled={submitting}>
              {submitting ? "저장 중..." : "저장"}
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
```

**Step 4: 테스트 실행 (PASS 확인)**

```bash
npx vitest run src/app/\(admin\)/admin/lore/
```

**Step 5: admin/page.tsx 빠른 이동에 Lore 링크 추가**

```tsx
// admin/page.tsx의 빠른 이동 섹션에 추가:
<Link href="/admin/lore"><Button size="sm" variant="secondary">Lore 관리</Button></Link>
```

**Step 6: 커밋**

```bash
git add src/app/\(admin\)/admin/lore/ src/app/\(admin\)/admin/page.tsx
git commit -m "feat(lore): 어드민 Lore 문서 관리 UI 추가"
```

---

## Task 6: 기존 Lore 문서 시드 데이터

**Files:**
- Create: `apps/dashboard/supabase/seed-lore.sql`

기존 `docs/lore/*.md` 파일을 DB에 seed 삽입. 실제 파일 내용을 SQL 이스케이프 처리해 삽입.

```sql
-- supabase/seed-lore.sql
-- 기존 6개 Lore 카테고리 → lore_documents 초기 데이터
-- 실행: psql -f seed-lore.sql 또는 Supabase SQL Editor에서 직접 실행

INSERT INTO lore_documents (id, title, slug, content, clearance_level, order_index)
VALUES
  ('lore_overview', '세계 개요', 'world-overview', '## 세계 개요\n\n(기존 world-overview.md 내용 붙여넣기)', 1, 0),
  ('lore_society', '사회 구조', 'society', '(기존 society.md 내용 붙여넣기)', 1, 1),
  ('lore_resonance', '공명율과 능력체계', 'resonance', '(기존 resonance-and-powers.md 내용)', 2, 2),
  ('lore_abilities', '능력 분류', 'abilities', '(기존 combat-system.md 능력 섹션)', 2, 3),
  ('lore_factions', '대립 구도', 'factions', '(기존 factions.md 내용)', 1, 4),
  ('lore_battle_rules', '전투 규칙', 'battle-rules', '(기존 combat-system.md 전투 섹션)', 3, 5)
ON CONFLICT (id) DO NOTHING;
```

> **주의:** 실제 내용은 `docs/lore/` 파일을 직접 읽어서 채워야 한다. 이 파일은 SQL Editor에서 수동으로 실행한다.

**Step 1: 기존 lore 파일 내용으로 seed 파일 작성**

```bash
# docs/lore/*.md 파일 목록 확인
ls ../../docs/lore/
```

실제 파일 내용을 읽어 seed-lore.sql의 content 필드에 채워 넣는다. 작은따옴표 이스케이프는 `''`로 처리.

**Step 2: 커밋**

```bash
git add supabase/seed-lore.sql
git commit -m "docs(lore): 기존 Lore 문서 시드 SQL 추가"
```

---

## Task 7: 전체 테스트 및 빌드 확인

**Step 1: 전체 테스트 실행**

```bash
cd apps/dashboard
npx vitest run 2>&1 | tail -10
```

Expected: pre-existing 14건 실패 외 추가 실패 없음

**Step 2: 타입 체크**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: 에러 없음

**Step 3: 빌드 확인**

```bash
pnpm --filter @solaris/dashboard build 2>&1 | tail -20
```

Expected: 성공

**Step 4: 최종 커밋**

```bash
git add -A
git commit -m "feat(lore): Lore Admin CMS 구현 완료 — DB 기반 동적 문서 관리"
```

---

## 완료 기준

- [ ] `lore_documents` 테이블 마이그레이션 적용
- [ ] Lore 페이지 사이드바가 DB 문서 목록을 동적으로 렌더링
- [ ] 어드민에서 문서 생성/편집/삭제 가능
- [ ] 파일 업로드 + 직접 편집 두 가지 방식 모두 동작
- [ ] 전체 테스트 pre-existing 14건 외 추가 실패 없음
- [ ] 타입 에러 없음
