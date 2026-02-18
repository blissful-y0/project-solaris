-- News tables: news, news_reactions

CREATE TABLE news (
  id text PRIMARY KEY,
  bulletin_number integer UNIQUE,
  title text NOT NULL,
  content text NOT NULL,
  source_type text NOT NULL CHECK (source_type IN ('auto', 'manual', 'battle')),
  category text NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);

COMMENT ON TABLE news IS '도시 뉴스 (전체 공개)';
COMMENT ON COLUMN news.bulletin_number IS '뉴스 고유 번호 (자동 증가)';

CREATE TABLE news_reactions (
  id text PRIMARY KEY,
  news_id text NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emoji text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  UNIQUE(news_id, user_id, emoji, deleted_at)
);

COMMENT ON TABLE news_reactions IS '뉴스 리액션 (사용자별 이모지)';
