-- 능력(Ability) 구조 리팩터링
-- characters 테이블에 능력 메타 컬럼 추가, abilities 테이블에서 weakness 제거

-- 1. characters 테이블에 능력 메타 컬럼 추가
ALTER TABLE public.characters
  ADD COLUMN IF NOT EXISTS ability_name text,
  ADD COLUMN IF NOT EXISTS ability_description text,
  ADD COLUMN IF NOT EXISTS ability_weakness text;

-- 2. 기존 abilities.weakness 데이터를 characters.ability_weakness로 이관
-- (기존에 3행 모두 동일한 abilityWeakness 값이 중복 저장되어 있으므로 첫 번째 값을 사용)
UPDATE public.characters c
SET ability_weakness = sub.weakness
FROM (
  SELECT DISTINCT ON (character_id) character_id, weakness
  FROM public.abilities
  WHERE weakness IS NOT NULL AND weakness <> ''
  ORDER BY character_id, tier
) sub
WHERE c.id = sub.character_id
  AND c.ability_weakness IS NULL;

-- 3. abilities 테이블에서 weakness 컬럼 제거
ALTER TABLE public.abilities DROP COLUMN IF EXISTS weakness;

-- 4. RPC 함수 재생성 (p_ability_name, p_ability_description, p_ability_weakness 파라미터 추가)
DROP FUNCTION IF EXISTS public.create_character_with_abilities(
  text, uuid, text, text, text, int, int, int, int, int, text, jsonb, text, text, text, boolean, text, jsonb
);

CREATE OR REPLACE FUNCTION public.create_character_with_abilities(
  p_id text,
  p_user_id uuid,
  p_name text,
  p_faction text,
  p_ability_class text,
  p_hp_max int,
  p_hp_current int,
  p_will_max int,
  p_will_current int,
  p_resonance_rate int,
  p_profile_image_url text,
  p_profile_data jsonb,
  p_appearance text,
  p_backstory text,
  p_notes text,
  p_leader_application boolean,
  p_crossover_style text,
  p_ability_name text,
  p_ability_description text,
  p_ability_weakness text,
  p_abilities jsonb
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ability jsonb;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION '권한이 없습니다.';
  END IF;

  INSERT INTO public.characters (
    id, user_id, name, faction, ability_class,
    hp_max, hp_current, will_max, will_current,
    resonance_rate, profile_image_url, profile_data,
    appearance, backstory, notes,
    leader_application, crossover_style,
    ability_name, ability_description, ability_weakness,
    status
  ) VALUES (
    p_id, p_user_id, p_name, p_faction, p_ability_class,
    p_hp_max, p_hp_current, p_will_max, p_will_current,
    p_resonance_rate, p_profile_image_url, p_profile_data,
    p_appearance, p_backstory, p_notes,
    p_leader_application, p_crossover_style,
    p_ability_name, p_ability_description, NULLIF(p_ability_weakness, ''),
    'pending'
  );

  FOR ability IN SELECT * FROM jsonb_array_elements(p_abilities)
  LOOP
    INSERT INTO public.abilities (
      id, character_id, tier, name, description, cost_hp, cost_will
    ) VALUES (
      ability->>'id', p_id, ability->>'tier', ability->>'name',
      ability->>'description',
      COALESCE((ability->>'cost_hp')::int, 0),
      COALESCE((ability->>'cost_will')::int, 0)
    );
  END LOOP;

  RETURN p_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_character_with_abilities(
  text, uuid, text, text, text, int, int, int, int, int, text, jsonb, text, text, text, boolean, text, text, text, text, jsonb
) TO authenticated;
