-- 020_join_operation_participant_atomic.sql
-- operation 참가를 원자적으로 처리해 max_participants 초과를 방지한다.

CREATE OR REPLACE FUNCTION join_operation_participant(
  p_operation_id text,
  p_character_id text,
  p_team text,
  p_participant_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_operation record;
  v_existing record;
  v_active_count integer;
  v_inserted record;
BEGIN
  SELECT id, status, max_participants
    INTO v_operation
  FROM operations
  WHERE id = p_operation_id
    AND deleted_at IS NULL
  FOR UPDATE;

  IF v_operation.id IS NULL THEN
    RAISE EXCEPTION 'NOT_FOUND';
  END IF;

  IF v_operation.status = 'completed' THEN
    RAISE EXCEPTION 'OPERATION_CLOSED';
  END IF;

  SELECT id, team, role
    INTO v_existing
  FROM operation_participants
  WHERE operation_id = p_operation_id
    AND character_id = p_character_id
    AND deleted_at IS NULL
  LIMIT 1;

  IF v_existing.id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'state', 'already_joined',
      'participant_id', v_existing.id,
      'team', v_existing.team,
      'role', v_existing.role
    );
  END IF;

  SELECT COUNT(*)::integer
    INTO v_active_count
  FROM operation_participants
  WHERE operation_id = p_operation_id
    AND deleted_at IS NULL;

  IF v_active_count >= v_operation.max_participants THEN
    RETURN jsonb_build_object('state', 'operation_full');
  END IF;

  INSERT INTO operation_participants (
    id,
    operation_id,
    character_id,
    team,
    role
  ) VALUES (
    p_participant_id,
    p_operation_id,
    p_character_id,
    p_team,
    'member'
  )
  RETURNING id, team, role
  INTO v_inserted;

  RETURN jsonb_build_object(
    'state', 'joined',
    'participant_id', v_inserted.id,
    'team', v_inserted.team,
    'role', v_inserted.role
  );
END;
$$;
