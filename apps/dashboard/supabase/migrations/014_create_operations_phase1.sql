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
  team text NOT NULL CHECK (team IN ('bureau', 'static', 'defector')),
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

-- RLS: 최소 권한 원칙 적용
ALTER TABLE operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE operation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE operation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE lore_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE lore_request_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lore_request_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "operations_authenticated_all" ON operations;
CREATE POLICY "operations_select_authenticated"
  ON operations
  FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "operations_insert_owned_character"
  ON operations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1
      FROM characters c
      WHERE c.id = operations.created_by
        AND c.user_id = auth.uid()
        AND c.deleted_at IS NULL
    )
  );

CREATE POLICY "operations_update_creator_or_admin"
  ON operations
  FOR UPDATE
  TO authenticated
  USING (
    deleted_at IS NULL
    AND (
      EXISTS (
        SELECT 1
        FROM characters c
        WHERE c.id = operations.created_by
          AND c.user_id = auth.uid()
          AND c.deleted_at IS NULL
      )
      OR EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid()
          AND u.role = 'admin'
          AND u.deleted_at IS NULL
      )
    )
  )
  WITH CHECK (
    deleted_at IS NULL
    AND (
      EXISTS (
        SELECT 1
        FROM characters c
        WHERE c.id = operations.created_by
          AND c.user_id = auth.uid()
          AND c.deleted_at IS NULL
      )
      OR EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid()
          AND u.role = 'admin'
          AND u.deleted_at IS NULL
      )
    )
  );

DROP POLICY IF EXISTS "operation_participants_authenticated_all" ON operation_participants;
CREATE POLICY "operation_participants_select_authenticated"
  ON operation_participants
  FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "operation_participants_insert_own_character"
  ON operation_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1
      FROM characters c
      WHERE c.id = operation_participants.character_id
        AND c.user_id = auth.uid()
        AND c.deleted_at IS NULL
    )
    AND EXISTS (
      SELECT 1
      FROM operations o
      WHERE o.id = operation_participants.operation_id
        AND o.deleted_at IS NULL
    )
  );

CREATE POLICY "operation_participants_update_self_or_admin"
  ON operation_participants
  FOR UPDATE
  TO authenticated
  USING (
    deleted_at IS NULL
    AND (
      EXISTS (
        SELECT 1
        FROM characters c
        WHERE c.id = operation_participants.character_id
          AND c.user_id = auth.uid()
          AND c.deleted_at IS NULL
      )
      OR EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid()
          AND u.role = 'admin'
          AND u.deleted_at IS NULL
      )
    )
  )
  WITH CHECK (
    deleted_at IS NULL
    AND (
      EXISTS (
        SELECT 1
        FROM characters c
        WHERE c.id = operation_participants.character_id
          AND c.user_id = auth.uid()
          AND c.deleted_at IS NULL
      )
      OR EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid()
          AND u.role = 'admin'
          AND u.deleted_at IS NULL
      )
    )
  );

DROP POLICY IF EXISTS "operation_messages_authenticated_all" ON operation_messages;
CREATE POLICY "operation_messages_select_authenticated"
  ON operation_messages
  FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "operation_messages_insert_owned_sender"
  ON operation_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    deleted_at IS NULL
    AND sender_character_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM characters c
      WHERE c.id = operation_messages.sender_character_id
        AND c.user_id = auth.uid()
        AND c.deleted_at IS NULL
    )
    AND EXISTS (
      SELECT 1
      FROM operation_participants p
      WHERE p.operation_id = operation_messages.operation_id
        AND p.character_id = operation_messages.sender_character_id
        AND p.deleted_at IS NULL
    )
  );

CREATE POLICY "operation_messages_update_admin_only"
  ON operation_messages
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
        AND u.role = 'admin'
        AND u.deleted_at IS NULL
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
        AND u.role = 'admin'
        AND u.deleted_at IS NULL
    )
  );

DROP POLICY IF EXISTS "lore_requests_authenticated_all" ON lore_requests;
CREATE POLICY "lore_requests_select_authenticated"
  ON lore_requests
  FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "lore_requests_insert_owned_requester"
  ON lore_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1
      FROM characters c
      WHERE c.id = lore_requests.requester_id
        AND c.user_id = auth.uid()
        AND c.deleted_at IS NULL
    )
  );

DROP POLICY IF EXISTS "lore_request_segments_authenticated_all" ON lore_request_segments;
CREATE POLICY "lore_request_segments_select_authenticated"
  ON lore_request_segments
  FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "lore_request_segments_insert_authenticated"
  ON lore_request_segments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1
      FROM lore_requests lr
      WHERE lr.id = lore_request_segments.lore_request_id
        AND lr.deleted_at IS NULL
    )
  );

DROP POLICY IF EXISTS "lore_request_votes_authenticated_all" ON lore_request_votes;
CREATE POLICY "lore_request_votes_select_authenticated"
  ON lore_request_votes
  FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "lore_request_votes_insert_owned_voter"
  ON lore_request_votes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1
      FROM characters c
      WHERE c.id = lore_request_votes.voter_id
        AND c.user_id = auth.uid()
        AND c.deleted_at IS NULL
    )
  );
