-- Operation encounter backend (sequential input + single execution)

CREATE TABLE IF NOT EXISTS operation_encounters (
  id text PRIMARY KEY,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'in_progress' CHECK (
    status IN ('in_progress', 'completed', 'cancelled')
  ),
  current_turn integer NOT NULL DEFAULT 1,
  result text NULL CHECK (result IN ('defeated', 'escaped', 'withdrawn', 'timeout')),
  created_by text NOT NULL REFERENCES characters(id) ON DELETE RESTRICT,
  gm_closed_by uuid NULL REFERENCES users(id) ON DELETE SET NULL,
  ended_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);

CREATE TABLE IF NOT EXISTS operation_encounter_participants (
  id bigserial PRIMARY KEY,
  encounter_id text NOT NULL REFERENCES operation_encounters(id) ON DELETE CASCADE,
  character_id text NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  team text NOT NULL,
  submission_order integer NOT NULL CHECK (submission_order > 0),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(encounter_id, character_id),
  UNIQUE(encounter_id, submission_order)
);

CREATE TABLE IF NOT EXISTS operation_turns (
  id text PRIMARY KEY,
  encounter_id text NOT NULL REFERENCES operation_encounters(id) ON DELETE CASCADE,
  turn_number integer NOT NULL CHECK (turn_number > 0),
  status text NOT NULL DEFAULT 'collecting' CHECK (
    status IN ('collecting', 'ready', 'resolved')
  ),
  resolution_idempotency_key text NULL,
  judgement jsonb NULL,
  action_results jsonb NULL,
  execution_summary jsonb NULL,
  resolved_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  UNIQUE(encounter_id, turn_number),
  UNIQUE(resolution_idempotency_key)
);

CREATE TABLE IF NOT EXISTS operation_turn_submissions (
  id text PRIMARY KEY,
  turn_id text NOT NULL REFERENCES operation_turns(id) ON DELETE CASCADE,
  participant_character_id text NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  ability_id text NULL REFERENCES abilities(id) ON DELETE SET NULL,
  ability_tier text NULL CHECK (ability_tier IN ('basic', 'mid', 'advanced')),
  action_type text NOT NULL CHECK (action_type IN ('attack', 'defend', 'support')),
  target_character_id text NULL REFERENCES characters(id) ON DELETE SET NULL,
  target_stat text NULL CHECK (target_stat IN ('hp', 'will')),
  base_damage integer NOT NULL DEFAULT 20 CHECK (base_damage >= 0),
  multiplier numeric(6,3) NOT NULL DEFAULT 1,
  cost_hp integer NOT NULL DEFAULT 0 CHECK (cost_hp >= 0),
  cost_will integer NOT NULL DEFAULT 0 CHECK (cost_will >= 0),
  narrative text NULL,
  is_auto_fail boolean NOT NULL DEFAULT false,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(turn_id, participant_character_id)
);

CREATE TABLE IF NOT EXISTS operation_turn_effects (
  id bigserial PRIMARY KEY,
  turn_id text NOT NULL REFERENCES operation_turns(id) ON DELETE CASCADE,
  source_character_id text NULL REFERENCES characters(id) ON DELETE SET NULL,
  target_character_id text NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  target_stat text NOT NULL CHECK (target_stat IN ('hp', 'will')),
  delta integer NOT NULL,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_operation_encounters_status
  ON operation_encounters(status)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_operation_encounter_participants_encounter
  ON operation_encounter_participants(encounter_id);

CREATE INDEX IF NOT EXISTS idx_operation_turns_encounter_turn
  ON operation_turns(encounter_id, turn_number DESC);

CREATE INDEX IF NOT EXISTS idx_operation_turn_submissions_turn
  ON operation_turn_submissions(turn_id);

CREATE INDEX IF NOT EXISTS idx_operation_turn_effects_turn
  ON operation_turn_effects(turn_id);

ALTER TABLE operation_encounters ENABLE ROW LEVEL SECURITY;
ALTER TABLE operation_encounter_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE operation_turns ENABLE ROW LEVEL SECURITY;
ALTER TABLE operation_turn_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE operation_turn_effects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "operation_encounters_select_participants"
ON operation_encounters FOR SELECT
USING (
  deleted_at IS NULL
  AND EXISTS (
    SELECT 1
    FROM operation_encounter_participants p
    JOIN characters c ON c.id = p.character_id
    WHERE p.encounter_id = operation_encounters.id
      AND p.is_active = true
      AND c.user_id = auth.uid()
      AND c.deleted_at IS NULL
  )
);

CREATE POLICY "operation_encounters_insert_participant"
ON operation_encounters FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM characters c
    WHERE c.id = operation_encounters.created_by
      AND c.user_id = auth.uid()
      AND c.deleted_at IS NULL
  )
);

CREATE POLICY "operation_encounters_update_participants_or_admin"
ON operation_encounters FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM operation_encounter_participants p
    JOIN characters c ON c.id = p.character_id
    WHERE p.encounter_id = operation_encounters.id
      AND p.is_active = true
      AND c.user_id = auth.uid()
      AND c.deleted_at IS NULL
  )
  OR EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid() AND u.role = 'admin' AND u.deleted_at IS NULL
  )
);

CREATE POLICY "operation_encounter_participants_select_participants"
ON operation_encounter_participants FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM operation_encounter_participants p2
    JOIN characters c ON c.id = p2.character_id
    WHERE p2.encounter_id = operation_encounter_participants.encounter_id
      AND p2.is_active = true
      AND c.user_id = auth.uid()
      AND c.deleted_at IS NULL
  )
);

CREATE POLICY "operation_turns_select_participants"
ON operation_turns FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM operation_encounter_participants p
    JOIN characters c ON c.id = p.character_id
    WHERE p.encounter_id = operation_turns.encounter_id
      AND p.is_active = true
      AND c.user_id = auth.uid()
      AND c.deleted_at IS NULL
  )
);

CREATE POLICY "operation_turn_submissions_select_participants"
ON operation_turn_submissions FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM operation_turns t
    JOIN operation_encounter_participants p ON p.encounter_id = t.encounter_id
    JOIN characters c ON c.id = p.character_id
    WHERE t.id = operation_turn_submissions.turn_id
      AND p.is_active = true
      AND c.user_id = auth.uid()
      AND c.deleted_at IS NULL
  )
);

CREATE POLICY "operation_turn_effects_select_participants"
ON operation_turn_effects FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM operation_turns t
    JOIN operation_encounter_participants p ON p.encounter_id = t.encounter_id
    JOIN characters c ON c.id = p.character_id
    WHERE t.id = operation_turn_effects.turn_id
      AND p.is_active = true
      AND c.user_id = auth.uid()
      AND c.deleted_at IS NULL
  )
);

CREATE OR REPLACE FUNCTION submit_operation_action(
  p_encounter_id text,
  p_ability_id text,
  p_action_type text,
  p_target_character_id text,
  p_target_stat text,
  p_base_damage integer,
  p_multiplier numeric,
  p_narrative text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_character_id text;
  v_actor_order integer;
  v_next_order integer;
  v_turn_id text;
  v_turn_number integer;
  v_turn_status text;
  v_ability record;
  v_character record;
  v_submission_id text;
  v_participants_total integer;
  v_submissions_total integer;
BEGIN
  SELECT c.id
    INTO v_actor_character_id
  FROM characters c
  JOIN operation_encounter_participants p
    ON p.character_id = c.id
   AND p.encounter_id = p_encounter_id
   AND p.is_active = true
  WHERE c.user_id = auth.uid()
    AND c.status = 'approved'
    AND c.deleted_at IS NULL
  LIMIT 1;

  IF v_actor_character_id IS NULL THEN
    RAISE EXCEPTION 'FORBIDDEN';
  END IF;

  SELECT submission_order
    INTO v_actor_order
  FROM operation_encounter_participants
  WHERE encounter_id = p_encounter_id
    AND character_id = v_actor_character_id
    AND is_active = true;

  IF v_actor_order IS NULL THEN
    RAISE EXCEPTION 'FORBIDDEN';
  END IF;

  SELECT id, turn_number, status
    INTO v_turn_id, v_turn_number, v_turn_status
  FROM operation_turns
  WHERE encounter_id = p_encounter_id
    AND status IN ('collecting', 'ready')
  ORDER BY turn_number DESC
  LIMIT 1
  FOR UPDATE;

  IF v_turn_id IS NULL THEN
    SELECT COALESCE(MAX(turn_number), 0) + 1
      INTO v_turn_number
    FROM operation_turns
    WHERE encounter_id = p_encounter_id;

    v_turn_id := 'ot_' || substr(md5(clock_timestamp()::text || random()::text), 1, 12);

    INSERT INTO operation_turns (id, encounter_id, turn_number, status)
    VALUES (v_turn_id, p_encounter_id, v_turn_number, 'collecting');

    v_turn_status := 'collecting';
  END IF;

  IF v_turn_status <> 'collecting' THEN
    RAISE EXCEPTION 'TURN_NOT_COLLECTING';
  END IF;

  IF EXISTS (
    SELECT 1 FROM operation_turn_submissions
    WHERE turn_id = v_turn_id
      AND participant_character_id = v_actor_character_id
  ) THEN
    RAISE EXCEPTION 'ALREADY_SUBMITTED';
  END IF;

  SELECT MIN(p.submission_order)
    INTO v_next_order
  FROM operation_encounter_participants p
  WHERE p.encounter_id = p_encounter_id
    AND p.is_active = true
    AND NOT EXISTS (
      SELECT 1 FROM operation_turn_submissions s
      WHERE s.turn_id = v_turn_id
        AND s.participant_character_id = p.character_id
    );

  IF v_actor_order <> v_next_order THEN
    RAISE EXCEPTION 'OUT_OF_ORDER';
  END IF;

  SELECT id, tier, cost_hp, cost_will
    INTO v_ability
  FROM abilities
  WHERE id = p_ability_id
    AND character_id = v_actor_character_id
    AND deleted_at IS NULL;

  IF v_ability.id IS NULL THEN
    RAISE EXCEPTION 'INVALID_ABILITY';
  END IF;

  SELECT id, hp_current, will_current
    INTO v_character
  FROM characters
  WHERE id = v_actor_character_id
  FOR UPDATE;

  IF v_character.hp_current < v_ability.cost_hp OR v_character.will_current < v_ability.cost_will THEN
    RAISE EXCEPTION 'INSUFFICIENT_COST';
  END IF;

  UPDATE characters
  SET hp_current = GREATEST(0, hp_current - v_ability.cost_hp),
      will_current = GREATEST(0, will_current - v_ability.cost_will),
      updated_at = now()
  WHERE id = v_actor_character_id;

  v_submission_id := 'os_' || substr(md5(clock_timestamp()::text || random()::text), 1, 12);

  INSERT INTO operation_turn_submissions (
    id,
    turn_id,
    participant_character_id,
    ability_id,
    ability_tier,
    action_type,
    target_character_id,
    target_stat,
    base_damage,
    multiplier,
    cost_hp,
    cost_will,
    narrative,
    is_auto_fail
  ) VALUES (
    v_submission_id,
    v_turn_id,
    v_actor_character_id,
    v_ability.id,
    v_ability.tier,
    p_action_type,
    p_target_character_id,
    p_target_stat,
    COALESCE(p_base_damage, 20),
    COALESCE(p_multiplier, 1),
    v_ability.cost_hp,
    v_ability.cost_will,
    p_narrative,
    false
  );

  SELECT COUNT(*)
    INTO v_participants_total
  FROM operation_encounter_participants
  WHERE encounter_id = p_encounter_id
    AND is_active = true;

  SELECT COUNT(*)
    INTO v_submissions_total
  FROM operation_turn_submissions
  WHERE turn_id = v_turn_id;

  IF v_submissions_total >= v_participants_total THEN
    UPDATE operation_turns
    SET status = 'ready',
        updated_at = now()
    WHERE id = v_turn_id;
  END IF;

  RETURN jsonb_build_object(
    'turn_id', v_turn_id,
    'turn_number', v_turn_number,
    'submission_id', v_submission_id,
    'ready_to_resolve', v_submissions_total >= v_participants_total,
    'actor_character_id', v_actor_character_id
  );
END;
$$;

CREATE OR REPLACE FUNCTION apply_operation_resolution(
  p_turn_id text,
  p_idempotency_key text,
  p_action_results jsonb,
  p_effects jsonb,
  p_execution_summary jsonb,
  p_close_result text DEFAULT NULL,
  p_closed_by uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_turn record;
  v_encounter_id text;
  v_effect jsonb;
  v_current integer;
  v_new integer;
  v_target_stat text;
  v_damage integer;
BEGIN
  SELECT t.*
    INTO v_turn
  FROM operation_turns t
  WHERE t.id = p_turn_id
  FOR UPDATE;

  IF v_turn.id IS NULL THEN
    RAISE EXCEPTION 'TURN_NOT_FOUND';
  END IF;

  v_encounter_id := v_turn.encounter_id;

  IF NOT (
    EXISTS (
      SELECT 1
      FROM operation_encounter_participants p
      JOIN characters c ON c.id = p.character_id
      WHERE p.encounter_id = v_encounter_id
        AND p.is_active = true
        AND c.user_id = auth.uid()
        AND c.deleted_at IS NULL
    )
    OR EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin' AND u.deleted_at IS NULL
    )
  ) THEN
    RAISE EXCEPTION 'FORBIDDEN';
  END IF;

  IF v_turn.resolution_idempotency_key IS NOT NULL THEN
    IF v_turn.resolution_idempotency_key = p_idempotency_key THEN
      RETURN jsonb_build_object(
        'turn_id', v_turn.id,
        'status', v_turn.status,
        'idempotent_replay', true,
        'execution_summary', COALESCE(v_turn.execution_summary, '{}'::jsonb)
      );
    END IF;

    RAISE EXCEPTION 'IDEMPOTENCY_CONFLICT';
  END IF;

  FOR v_effect IN SELECT * FROM jsonb_array_elements(COALESCE(p_effects, '[]'::jsonb))
  LOOP
    v_target_stat := v_effect->>'target_stat';
    v_damage := COALESCE((v_effect->>'damage')::integer, 0);

    IF v_target_stat = 'hp' THEN
      SELECT hp_current INTO v_current
      FROM characters
      WHERE id = (v_effect->>'target_character_id')
      FOR UPDATE;

      v_new := GREATEST(0, COALESCE(v_current, 0) - GREATEST(0, v_damage));

      UPDATE characters
      SET hp_current = v_new,
          updated_at = now()
      WHERE id = (v_effect->>'target_character_id');

      INSERT INTO operation_turn_effects (
        turn_id,
        source_character_id,
        target_character_id,
        target_stat,
        delta,
        reason
      ) VALUES (
        p_turn_id,
        NULLIF(v_effect->>'source_character_id', ''),
        v_effect->>'target_character_id',
        'hp',
        -(GREATEST(0, v_damage)),
        COALESCE(v_effect->>'reason', 'attack')
      );
    ELSE
      SELECT will_current INTO v_current
      FROM characters
      WHERE id = (v_effect->>'target_character_id')
      FOR UPDATE;

      v_new := GREATEST(0, COALESCE(v_current, 0) - GREATEST(0, v_damage));

      UPDATE characters
      SET will_current = v_new,
          updated_at = now()
      WHERE id = (v_effect->>'target_character_id');

      INSERT INTO operation_turn_effects (
        turn_id,
        source_character_id,
        target_character_id,
        target_stat,
        delta,
        reason
      ) VALUES (
        p_turn_id,
        NULLIF(v_effect->>'source_character_id', ''),
        v_effect->>'target_character_id',
        'will',
        -(GREATEST(0, v_damage)),
        COALESCE(v_effect->>'reason', 'attack')
      );
    END IF;
  END LOOP;

  UPDATE operation_turns
  SET status = 'resolved',
      resolution_idempotency_key = p_idempotency_key,
      action_results = COALESCE(p_action_results, '[]'::jsonb),
      execution_summary = COALESCE(p_execution_summary, '{}'::jsonb),
      resolved_at = now(),
      updated_at = now()
  WHERE id = p_turn_id;

  IF p_close_result IS NOT NULL THEN
    UPDATE operation_encounters
    SET status = 'completed',
        result = p_close_result,
        ended_at = now(),
        gm_closed_by = p_closed_by,
        updated_at = now()
    WHERE id = v_encounter_id;
  END IF;

  RETURN jsonb_build_object(
    'turn_id', p_turn_id,
    'status', 'resolved',
    'idempotent_replay', false,
    'execution_summary', COALESCE(p_execution_summary, '{}'::jsonb)
  );
END;
$$;
