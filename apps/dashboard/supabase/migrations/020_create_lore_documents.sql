-- 020_create_lore_documents.sql
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
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE lore_documents ENABLE ROW LEVEL SECURITY;

-- 인증된 유저 전체 조회 허용 (클리어런스 필터는 앱 레이어에서)
CREATE POLICY "lore_documents_select_authenticated"
  ON lore_documents FOR SELECT TO authenticated
  USING (deleted_at IS NULL);

-- 어드민만 INSERT/UPDATE/DELETE
CREATE POLICY "lore_documents_insert_admin"
  ON lore_documents FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "lore_documents_update_admin"
  ON lore_documents FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "lore_documents_delete_admin"
  ON lore_documents FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));
