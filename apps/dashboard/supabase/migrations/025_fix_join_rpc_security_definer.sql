-- 025_fix_join_rpc_security_definer.sql
-- SECURITY INVOKER → SECURITY DEFINER 변경
--
-- 문제: SECURITY INVOKER + FOR UPDATE 조합이 operations 테이블의
--       UPDATE RLS 정책(생성자/admin만 허용)을 요구해서 일반 유저의 join이 실패함.
-- 해결: API 라우트에서 인증/인가/존재 확인을 모두 수행하므로,
--       RPC는 원자적 동시성 제어만 담당. SECURITY DEFINER로 RLS 우회 안전.

CREATE OR REPLACE FUNCTION join_operation_participant(
  p_operation_id text,
  p_character_id text,
  p_team text,
  p_participant_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
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
