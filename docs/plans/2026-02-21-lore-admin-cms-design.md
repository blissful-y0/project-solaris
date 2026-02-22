# Lore Admin CMS 설계

날짜: 2026-02-21
브랜치: feat/lore-admin-cms (develop 기준)

## 목적

현재 파일시스템 기반(`docs/lore/*.md`, 6개 고정 카테고리)인 Lore 시스템을 DB 기반 동적 CMS로 교체한다.
어드민이 마크다운 파일을 업로드하거나 브라우저 에디터로 직접 작성/수정하면 Lore 페이지에 즉시 반영된다.

---

## 아키텍처

### DB 스키마

```sql
CREATE TABLE lore_documents (
  id              text PRIMARY KEY,
  title           text NOT NULL,
  slug            text NOT NULL,
  content         text NOT NULL DEFAULT '',
  clearance_level integer NOT NULL DEFAULT 1
    CHECK (clearance_level IN (1, 2, 3)),
  order_index     integer NOT NULL DEFAULT 0,
  deleted_at      timestamptz NULL,
  created_at      timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at      timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE UNIQUE INDEX uq_lore_documents_slug
  ON lore_documents(slug)
  WHERE deleted_at IS NULL;
```

**클리어런스 레벨**: 1=PUBLIC, 2=RESTRICTED, 3=CLASSIFIED

**RLS**:
- SELECT: `authenticated` 전체 허용 (클리어런스 필터는 API 레이어)
- INSERT/UPDATE/DELETE: `admin` 역할 보유 유저만

### API 라우트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/lore` | 사용자 클리어런스 이하 문서 목록 (content 제외) |
| GET | `/api/lore/[slug]` | 단일 문서 전체 (content 포함) |
| GET | `/api/admin/lore` | 전체 목록 (어드민, 삭제 포함 제외) |
| POST | `/api/admin/lore` | 신규 문서 생성 |
| PUT | `/api/admin/lore/[id]` | 문서 수정 (내용/제목/클리어런스/순서) |
| DELETE | `/api/admin/lore/[id]` | soft delete |

### Lore 페이지 변경

- `loadAllLoreContents()` → `/api/lore` 호출로 교체
- 사이드바: 하드코딩된 6개 카테고리 → DB 문서 목록 동적 렌더링
- 라우팅: `/lore` → 첫 번째 문서, `/lore/[slug]` → 해당 문서
- 기존 `[REDACTED]` 처리 및 AI GM 지시 stripping 로직 재사용

---

## 어드민 UI (`/admin/lore`)

### 목록 화면

```
┌─────────────────────────────────────────────┐
│ LORE DOCUMENTS              [+ 새 문서]      │
├─────────────────────────────────────────────┤
│ ≡  World Overview      PUBLIC   [편집] [삭제]│
│ ≡  Factions            RESTRICTED  [편집] [삭제]│
│ ≡  Battle Rules        CLASSIFIED  [편집] [삭제]│
└─────────────────────────────────────────────┘
```

- `≡` 핸들: 순서 변경 (드래그앤드롭 또는 순서 입력)
- 클리어런스 Badge 표시

### 문서 생성/편집 모달

필드:
- 제목 (text input)
- 슬러그 (제목에서 자동 생성, 수동 수정 가능)
- 클리어런스 (칩 선택: PUBLIC / RESTRICTED / CLASSIFIED)
- 내용 탭:
  - "파일 업로드" — `.md` 드래그앤드롭 또는 파일 선택
  - "직접 편집" — textarea (마크다운)

---

## 마이그레이션 고려사항

- 기존 `docs/lore/*.md` 파일 6개는 시드 데이터로 DB에 일괄 삽입 (seed 스크립트)
- 기존 `lore-data.ts`, `types.ts`의 하드코딩 제거
- `LoreCategoryId` union type 삭제, slug string으로 교체

---

## 범위 제외 (YAGNI)

- 마크다운 프리뷰 실시간 렌더링 (편집 textarea는 plain)
- 버전 히스토리
- 다중 언어 지원
- 이미지 업로드
