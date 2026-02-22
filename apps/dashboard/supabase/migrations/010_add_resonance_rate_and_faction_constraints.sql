-- characters 공명율 추가 + 진영별 제약 + RPC 파라미터 확장

ALTER TABLE public.characters
  ADD COLUMN IF NOT EXISTS resonance_rate integer;

UPDATE public.characters
SET resonance_rate = CASE
  WHEN faction = 'bureau' THEN 80
  WHEN faction = 'static' THEN 15
  ELSE 0
END
WHERE resonance_rate IS NULL;

ALTER TABLE public.characters
  ALTER COLUMN resonance_rate SET NOT NULL,
  ALTER COLUMN resonance_rate SET DEFAULT 0;

ALTER TABLE public.characters
  DROP CONSTRAINT IF EXISTS characters_resonance_rate_range,
  ADD CONSTRAINT characters_resonance_rate_range CHECK (resonance_rate BETWEEN 0 AND 100);

ALTER TABLE public.characters
  DROP CONSTRAINT IF EXISTS characters_resonance_rate_faction_rule,
  ADD CONSTRAINT characters_resonance_rate_faction_rule CHECK (
    (faction = 'bureau' AND resonance_rate >= 80)
    OR (faction = 'static' AND resonance_rate <= 15)
    OR (faction NOT IN ('bureau', 'static'))
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
    resonance_rate,
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
    p_resonance_rate,
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
  text, uuid, text, text, text, int, int, int, int, int, jsonb, text, text, boolean, text, jsonb
) TO authenticated;
