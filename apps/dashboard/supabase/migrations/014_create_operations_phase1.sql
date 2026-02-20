-- 014_create_operations_phase1.sql
-- 목적: Downtime 1차 연동(목록/상세/메시지/서사요청 기초) 테이블 추가
-- 주의: 기존 operation_encounters 스키마(013)와 충돌하지 않도록 신규 테이블만 생성

CREATE TABLE IF NOT EXISTS operations (
  id text PRIMARY KEY,
  title text NOT NULL,
  type text NOT NULL CHECK (type IN ('operation', 'downtime')),
  status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'live', 'completed')),
  summary text NOT NULL DEFAULT '',
  is_main_story boolean NOT NULL DEFAULT false,
  max_participants integer NOT NULL DEFAULT 8 CHECK (max_participants >= 2 AND max_participants <= 12),
  current_turn integer NULL,
  created_by text NULL REFERENCES characters(id) ON DELETE SET NULL,
  deleted_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS operation_participants (
  id text PRIMARY KEY,
  operation_id text NOT NULL REFERENCES operations(id) ON DELETE CASCADE,
  character_id text NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  team text NOT NULL CHECK (team IN ('ally', 'enemy', 'host')),
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'observer')),
  deleted_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_operation_participants_active
  ON operation_participants(operation_id, character_id)
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS operation_messages (
  id text PRIMARY KEY,
  operation_id text NOT NULL REFERENCES operations(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('narration', 'gm_narration', 'system', 'judgment', 'narrative_request')),
  sender_character_id text NULL REFERENCES characters(id) ON DELETE SET NULL,
  content text NOT NULL DEFAULT '',
  payload jsonb NULL,
  deleted_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_operations_status
  ON operations(status)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_operations_type
  ON operations(type)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_op_participants_operation
  ON operation_participants(operation_id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_op_messages_operation_created
  ON operation_messages(operation_id, created_at)
  WHERE deleted_at IS NULL;

-- 서사 반영(v1) 테이블: 1차 API는 아직 미구현이지만, 합의된 스키마를 먼저 확보
CREATE TABLE IF NOT EXISTS lore_requests (
  id text PRIMARY KEY,
  operation_id text NOT NULL REFERENCES operations(id) ON DELETE CASCADE,
  requester_id text NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'voting' CHECK (status IN ('voting', 'approved', 'rejected')),
  range_start_message_id text NOT NULL REFERENCES operation_messages(id) ON DELETE RESTRICT,
  range_end_message_id text NOT NULL REFERENCES operation_messages(id) ON DELETE RESTRICT,
  ai_summary text NULL,
  deleted_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS lore_request_segments (
  id text PRIMARY KEY,
  lore_request_id text NOT NULL REFERENCES lore_requests(id) ON DELETE CASCADE,
  operation_id text NOT NULL REFERENCES operations(id) ON DELETE CASCADE,
  message_id text NOT NULL REFERENCES operation_messages(id) ON DELETE RESTRICT,
  order_index integer NOT NULL,
  start_offset integer NULL,
  end_offset integer NULL,
  selected_text text NOT NULL,
  deleted_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS lore_request_votes (
  id text PRIMARY KEY,
  lore_request_id text NOT NULL REFERENCES lore_requests(id) ON DELETE CASCADE,
  operation_id text NOT NULL REFERENCES operations(id) ON DELETE CASCADE,
  voter_id text NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  vote text NOT NULL CHECK (vote IN ('reflect', 'skip')),
  deleted_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_lore_votes_active
  ON lore_request_votes(lore_request_id, voter_id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_lore_votes_operation
  ON lore_request_votes(operation_id)
  WHERE deleted_at IS NULL;

-- 공통 updated_at 트리거
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_operations_updated_at ON operations;
CREATE TRIGGER trg_operations_updated_at
  BEFORE UPDATE ON operations
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_operation_participants_updated_at ON operation_participants;
CREATE TRIGGER trg_operation_participants_updated_at
  BEFORE UPDATE ON operation_participants
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_operation_messages_updated_at ON operation_messages;
CREATE TRIGGER trg_operation_messages_updated_at
  BEFORE UPDATE ON operation_messages
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_lore_requests_updated_at ON lore_requests;
CREATE TRIGGER trg_lore_requests_updated_at
  BEFORE UPDATE ON lore_requests
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_lore_request_segments_updated_at ON lore_request_segments;
CREATE TRIGGER trg_lore_request_segments_updated_at
  BEFORE UPDATE ON lore_request_segments
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_lore_request_votes_updated_at ON lore_request_votes;
CREATE TRIGGER trg_lore_request_votes_updated_at
  BEFORE UPDATE ON lore_request_votes
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- operation_id 일치 강제: lore_request_segments
CREATE OR REPLACE FUNCTION enforce_lore_segment_operation_match()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  request_operation_id text;
BEGIN
  SELECT operation_id INTO request_operation_id
  FROM lore_requests
  WHERE id = NEW.lore_request_id;

  IF request_operation_id IS NULL THEN
    RAISE EXCEPTION 'INVALID_LORE_REQUEST';
  END IF;

  IF request_operation_id <> NEW.operation_id THEN
    RAISE EXCEPTION 'MISMATCHED_OPERATION_ID';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_lore_segment_operation_match ON lore_request_segments;
CREATE TRIGGER trg_enforce_lore_segment_operation_match
  BEFORE INSERT OR UPDATE ON lore_request_segments
  FOR EACH ROW
  EXECUTE FUNCTION enforce_lore_segment_operation_match();

-- operation_id 일치 강제: lore_request_votes
CREATE OR REPLACE FUNCTION enforce_lore_vote_operation_match()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  request_operation_id text;
BEGIN
  SELECT operation_id INTO request_operation_id
  FROM lore_requests
  WHERE id = NEW.lore_request_id;

  IF request_operation_id IS NULL THEN
    RAISE EXCEPTION 'INVALID_LORE_REQUEST';
  END IF;

  IF request_operation_id <> NEW.operation_id THEN
    RAISE EXCEPTION 'MISMATCHED_OPERATION_ID';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_lore_vote_operation_match ON lore_request_votes;
CREATE TRIGGER trg_enforce_lore_vote_operation_match
  BEFORE INSERT OR UPDATE ON lore_request_votes
  FOR EACH ROW
  EXECUTE FUNCTION enforce_lore_vote_operation_match();

-- RLS: 1차 구현은 인증 사용자 기준 완화 정책으로 시작
ALTER TABLE operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE operation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE operation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE lore_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE lore_request_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lore_request_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "operations_authenticated_all" ON operations;
CREATE POLICY "operations_authenticated_all"
  ON operations
  FOR ALL
  TO authenticated
  USING (deleted_at IS NULL)
  WITH CHECK (true);

DROP POLICY IF EXISTS "operation_participants_authenticated_all" ON operation_participants;
CREATE POLICY "operation_participants_authenticated_all"
  ON operation_participants
  FOR ALL
  TO authenticated
  USING (deleted_at IS NULL)
  WITH CHECK (true);

DROP POLICY IF EXISTS "operation_messages_authenticated_all" ON operation_messages;
CREATE POLICY "operation_messages_authenticated_all"
  ON operation_messages
  FOR ALL
  TO authenticated
  USING (deleted_at IS NULL)
  WITH CHECK (true);

DROP POLICY IF EXISTS "lore_requests_authenticated_all" ON lore_requests;
CREATE POLICY "lore_requests_authenticated_all"
  ON lore_requests
  FOR ALL
  TO authenticated
  USING (deleted_at IS NULL)
  WITH CHECK (true);

DROP POLICY IF EXISTS "lore_request_segments_authenticated_all" ON lore_request_segments;
CREATE POLICY "lore_request_segments_authenticated_all"
  ON lore_request_segments
  FOR ALL
  TO authenticated
  USING (deleted_at IS NULL)
  WITH CHECK (true);

DROP POLICY IF EXISTS "lore_request_votes_authenticated_all" ON lore_request_votes;
CREATE POLICY "lore_request_votes_authenticated_all"
  ON lore_request_votes
  FOR ALL
  TO authenticated
  USING (deleted_at IS NULL)
  WITH CHECK (true);
