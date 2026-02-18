-- 캐릭터 프로필 이미지 URL + 스토리지 버킷/정책

ALTER TABLE public.characters
  ADD COLUMN IF NOT EXISTS profile_image_url text;

DROP FUNCTION IF EXISTS public.create_character_with_abilities(
  text, uuid, text, text, text, int, int, int, int, int, jsonb, text, text, boolean, text, jsonb
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
    profile_image_url,
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
    p_profile_image_url,
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
  text, uuid, text, text, text, int, int, int, int, int, text, jsonb, text, text, boolean, text, jsonb
) TO authenticated;

INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
) VALUES (
  'character-profile-images',
  'character-profile-images',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "character_profile_images_insert" ON storage.objects;
CREATE POLICY "character_profile_images_insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'character-profile-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "character_profile_images_update" ON storage.objects;
CREATE POLICY "character_profile_images_update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'character-profile-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'character-profile-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "character_profile_images_delete" ON storage.objects;
CREATE POLICY "character_profile_images_delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'character-profile-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
