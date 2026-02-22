-- abilities 코스트 구조 개선 + 캐릭터 crossover_style 추가

ALTER TABLE public.characters
  ADD COLUMN IF NOT EXISTS crossover_style text NULL
  CHECK (
    crossover_style IS NULL
    OR crossover_style IN ('limiter-override', 'hardware-bypass', 'dead-reckoning', 'defector')
  );

ALTER TABLE public.abilities
  ADD COLUMN IF NOT EXISTS cost_hp integer NOT NULL DEFAULT 0 CHECK (cost_hp >= 0),
  ADD COLUMN IF NOT EXISTS cost_will integer NOT NULL DEFAULT 0 CHECK (cost_will >= 0);

UPDATE public.abilities
SET
  cost_hp = CASE WHEN cost_type = 'hp' THEN cost_amount ELSE 0 END,
  cost_will = CASE WHEN cost_type = 'will' THEN cost_amount ELSE 0 END
WHERE cost_amount IS NOT NULL;

ALTER TABLE public.abilities
  DROP COLUMN IF EXISTS cost_type,
  DROP COLUMN IF EXISTS cost_amount;

ALTER TABLE public.abilities
  ADD CONSTRAINT abilities_cost_not_zero CHECK (cost_hp > 0 OR cost_will > 0);

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
  p_profile_data jsonb,
  p_appearance text,
  p_backstory text,
  p_leader_application boolean,
  p_crossover_style text,
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
    id,
    user_id,
    name,
    faction,
    ability_class,
    hp_max,
    hp_current,
    will_max,
    will_current,
    profile_data,
    appearance,
    backstory,
    leader_application,
    crossover_style,
    status
  ) VALUES (
    p_id,
    p_user_id,
    p_name,
    p_faction,
    p_ability_class,
    p_hp_max,
    p_hp_current,
    p_will_max,
    p_will_current,
    p_profile_data,
    p_appearance,
    p_backstory,
    p_leader_application,
    p_crossover_style,
    'pending'
  );

  FOR ability IN SELECT * FROM jsonb_array_elements(p_abilities)
  LOOP
    INSERT INTO public.abilities (
      id,
      character_id,
      tier,
      name,
      description,
      weakness,
      cost_hp,
      cost_will
    ) VALUES (
      ability->>'id',
      p_id,
      ability->>'tier',
      ability->>'name',
      ability->>'description',
      NULLIF(ability->>'weakness', ''),
      COALESCE((ability->>'cost_hp')::int, 0),
      COALESCE((ability->>'cost_will')::int, 0)
    );
  END LOOP;

  RETURN p_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_character_with_abilities(
  text, uuid, text, text, text, int, int, int, int, jsonb, text, text, boolean, text, jsonb
) TO authenticated;
