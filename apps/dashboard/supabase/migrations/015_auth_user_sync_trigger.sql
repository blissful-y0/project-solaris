-- auth.users → public.users 자동 동기화 트리거
-- Discord OAuth 없이 로컬에서 직접 유저를 생성해도 users 테이블에 레코드가 자동 생성됨

CREATE OR REPLACE FUNCTION public.handle_auth_user_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (
    id,
    discord_id,
    discord_username
  ) VALUES (
    NEW.id,
    -- Discord OAuth 콜백이 있으면 실제 값으로 덮어씀(upsert on conflict)
    -- 직접 생성 시 uuid를 임시 discord_id로 사용
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'provider_id', ''),
      NULLIF(NEW.raw_user_meta_data->>'sub', ''),
      NEW.id::text
    ),
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
      NULLIF(NEW.raw_user_meta_data->>'name', ''),
      NULLIF(NEW.email, ''),
      'user-' || substr(NEW.id::text, 1, 8)
    )
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_created();
