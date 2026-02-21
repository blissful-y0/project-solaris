-- 019_remove_civilian_faction.sql
-- characters.faction에서 civilian을 제거하고 bureau/static/defector만 허용한다.

UPDATE characters
SET faction = 'static',
    ability_class = COALESCE(ability_class, 'field')
WHERE faction = 'civilian';

DO $$
DECLARE
  constraint_name text;
BEGIN
  FOR constraint_name IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.characters'::regclass
      AND contype = 'c'
      AND (
        pg_get_constraintdef(oid) ILIKE '%faction%'
        OR pg_get_constraintdef(oid) ILIKE '%ability_class%'
      )
  LOOP
    EXECUTE format('ALTER TABLE public.characters DROP CONSTRAINT %I', constraint_name);
  END LOOP;
END
$$;

ALTER TABLE public.characters
  ADD CONSTRAINT characters_faction_check
  CHECK (faction IN ('bureau', 'static', 'defector'));

ALTER TABLE public.characters
  ADD CONSTRAINT characters_ability_class_check
  CHECK (ability_class IN ('field', 'empathy', 'shift', 'compute'));

ALTER TABLE public.characters
  ADD CONSTRAINT characters_faction_ability_class_check
  CHECK (ability_class IS NOT NULL);

COMMENT ON COLUMN public.characters.ability_class IS '모든 캐릭터는 4가지 능력 계열 중 1개를 가진다.';
