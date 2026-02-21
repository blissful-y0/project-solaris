ALTER TABLE operation_participants
  DROP CONSTRAINT IF EXISTS operation_participants_team_check;

-- 017_normalize_operation_participants_team_to_faction.sql
-- operation_participants.team 값을 faction 단일 기준으로 정규화한다.
-- 기존 ally/enemy/host 데이터는 characters.faction으로 백필한다.
-- 매칭 캐릭터 faction이 예상 범위를 벗어나면 static으로 안전 정규화한다.

UPDATE operation_participants op
SET team = c.faction
FROM characters c
WHERE op.character_id = c.id
  AND c.faction IN ('bureau', 'static', 'defector')
  AND op.team IN ('ally', 'enemy', 'host');

UPDATE operation_participants
SET team = 'static'
WHERE team IN ('ally', 'enemy', 'host');

ALTER TABLE operation_participants
  ADD CONSTRAINT operation_participants_team_check
  CHECK (team IN ('bureau', 'static', 'defector'));
