-- Functions and triggers

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_characters_updated_at BEFORE UPDATE ON characters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_abilities_updated_at BEFORE UPDATE ON abilities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_reactions_updated_at BEFORE UPDATE ON news_reactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_civilian_merits_updated_at BEFORE UPDATE ON civilian_merits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION set_news_bulletin_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.bulletin_number IS NULL THEN
    SELECT COALESCE(MAX(bulletin_number), 0) + 1
      INTO NEW.bulletin_number
      FROM news;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_news_bulletin_number_trigger
BEFORE INSERT ON news
FOR EACH ROW
EXECUTE FUNCTION set_news_bulletin_number();

CREATE OR REPLACE FUNCTION create_character_with_abilities(
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
  p_abilities jsonb
) RETURNS text AS $$
DECLARE
  ability jsonb;
BEGIN
  -- SECURITY DEFINER 함수 오남용 방지
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION '권한이 없습니다.';
  END IF;

  INSERT INTO characters (
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
    'pending'
  );

  FOR ability IN SELECT * FROM jsonb_array_elements(p_abilities)
  LOOP
    INSERT INTO abilities (
      id,
      character_id,
      tier,
      name,
      description,
      weakness,
      cost_type,
      cost_amount
    ) VALUES (
      ability->>'id',
      p_id,
      ability->>'tier',
      ability->>'name',
      ability->>'description',
      NULLIF(ability->>'weakness', ''),
      ability->>'cost_type',
      (ability->>'cost_amount')::int
    );
  END LOOP;

  RETURN p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION create_character_with_abilities(
  text, uuid, text, text, text, int, int, int, int, jsonb, text, text, boolean, jsonb
) TO authenticated;
