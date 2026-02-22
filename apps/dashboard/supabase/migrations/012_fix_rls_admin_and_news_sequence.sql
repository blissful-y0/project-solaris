-- RLS admin recursion fix + soft-delete policy cleanup + news bulletin sequence

CREATE OR REPLACE FUNCTION public.is_admin(p_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = p_user_id
      AND u.role = 'admin'
      AND u.deleted_at IS NULL
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, service_role;

DROP POLICY IF EXISTS "users_select_admin" ON public.users;
CREATE POLICY "users_select_admin"
ON public.users FOR SELECT
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "characters_select_admin" ON public.characters;
CREATE POLICY "characters_select_admin"
ON public.characters FOR SELECT
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "characters_update_admin" ON public.characters;
CREATE POLICY "characters_update_admin"
ON public.characters FOR UPDATE
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "characters_delete_own_or_admin" ON public.characters;
CREATE POLICY "characters_delete_own_or_admin"
ON public.characters FOR DELETE
USING (
  user_id = auth.uid()
  OR public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "abilities_select_admin" ON public.abilities;
CREATE POLICY "abilities_select_admin"
ON public.abilities FOR SELECT
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "abilities_update_admin" ON public.abilities;
CREATE POLICY "abilities_update_admin"
ON public.abilities FOR UPDATE
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "abilities_delete_own_or_admin" ON public.abilities;
CREATE POLICY "abilities_delete_own_or_admin"
ON public.abilities FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.characters
    WHERE id = abilities.character_id
      AND user_id = auth.uid()
  )
  OR public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "news_select_admin" ON public.news;
CREATE POLICY "news_select_admin"
ON public.news FOR SELECT
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "news_insert_admin" ON public.news;
CREATE POLICY "news_insert_admin"
ON public.news FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "news_update_admin" ON public.news;
CREATE POLICY "news_update_admin"
ON public.news FOR UPDATE
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "news_delete_admin" ON public.news;
CREATE POLICY "news_soft_delete_admin"
ON public.news FOR UPDATE
USING (public.is_admin(auth.uid()))
WITH CHECK (deleted_at IS NOT NULL);

DROP POLICY IF EXISTS "notifications_insert_system" ON public.notifications;
CREATE POLICY "notifications_insert_system"
ON public.notifications FOR INSERT
WITH CHECK (
  auth.role() = 'service_role'
  OR public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "civilian_merits_insert_admin" ON public.civilian_merits;
CREATE POLICY "civilian_merits_insert_admin"
ON public.civilian_merits FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "civilian_merits_update_admin" ON public.civilian_merits;
CREATE POLICY "civilian_merits_update_admin"
ON public.civilian_merits FOR UPDATE
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "civilian_merits_delete_admin" ON public.civilian_merits;
CREATE POLICY "civilian_merits_soft_delete_admin"
ON public.civilian_merits FOR UPDATE
USING (public.is_admin(auth.uid()))
WITH CHECK (deleted_at IS NOT NULL);

DROP POLICY IF EXISTS "system_settings_select_admin" ON public.system_settings;
CREATE POLICY "system_settings_select_admin"
ON public.system_settings FOR SELECT
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "system_settings_update_admin" ON public.system_settings;
CREATE POLICY "system_settings_update_admin"
ON public.system_settings FOR UPDATE
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "users_delete_own" ON public.users;
CREATE POLICY "users_soft_delete_own"
ON public.users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (deleted_at IS NOT NULL);

CREATE SEQUENCE IF NOT EXISTS public.news_bulletin_number_seq;

SELECT setval(
  'public.news_bulletin_number_seq',
  GREATEST(COALESCE((SELECT MAX(bulletin_number) FROM public.news), 0), 1)
);

ALTER TABLE public.news
  ALTER COLUMN bulletin_number SET DEFAULT nextval('public.news_bulletin_number_seq');

CREATE OR REPLACE FUNCTION public.set_news_bulletin_number()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.bulletin_number IS NULL THEN
    NEW.bulletin_number := nextval('public.news_bulletin_number_seq');
  END IF;
  RETURN NEW;
END;
$$;
