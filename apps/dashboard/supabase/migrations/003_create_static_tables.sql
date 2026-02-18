-- Static tables: civilian_merits, system_settings, notifications

CREATE TABLE civilian_merits (
  id text PRIMARY KEY,
  name text UNIQUE NOT NULL,
  description text NOT NULL,
  effect text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);

COMMENT ON TABLE civilian_merits IS '비능력자 메리트 5개 (정적 데이터)';

CREATE TABLE system_settings (
  id text PRIMARY KEY DEFAULT 'default' CHECK (id = 'default'),
  gm_bias jsonb NOT NULL DEFAULT '{"lawbringer":0,"rogue":0,"neutral":0}'::jsonb,
  battle_settings jsonb NOT NULL DEFAULT '{"default_turn_duration_hours":24,"max_turn_duration_hours":72,"turn_edit_allowed":true,"turn_edit_count_limit":1}'::jsonb,
  character_settings jsonb NOT NULL DEFAULT '{"max_abilities":5,"min_abilities":2,"approval_required":true}'::jsonb,
  lore_settings jsonb NOT NULL DEFAULT '{"approval_threshold":0.7,"min_votes_required":2}'::jsonb,
  season jsonb NOT NULL DEFAULT '{"current_season":1,"season_start":null,"season_end":null}'::jsonb,
  ai_model_routing jsonb NOT NULL DEFAULT '{"version":1,"routes":{"main_story":{"primary":"claude-opus","fallback":["claude-sonnet"]},"battle_judgment":{"primary":"gemini-pro","fallback":["gemini-flash"]},"lore_reflection":{"primary":"gemini-flash","fallback":["claude-sonnet"]},"news_generation":{"primary":"gemini-flash","fallback":[]}}}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);

COMMENT ON TABLE system_settings IS '운영 정책 싱글톤 설정';

CREATE TABLE notifications (
  id text PRIMARY KEY,
  user_id uuid NULL REFERENCES users(id) ON DELETE SET NULL,
  scope text NOT NULL CHECK (scope IN ('user', 'broadcast')),
  type text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  channel text NOT NULL CHECK (channel IN ('in_app', 'discord_dm', 'discord_webhook')),
  delivery_status text NOT NULL DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'failed', 'skipped')),
  delivery_attempts integer NOT NULL DEFAULT 0 CHECK (delivery_attempts >= 0),
  last_error text NULL,
  read_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((scope = 'user' AND user_id IS NOT NULL) OR scope = 'broadcast')
);

COMMENT ON TABLE notifications IS '알림 로그 (개인/브로드캐스트 + 전송 상태 포함)';
