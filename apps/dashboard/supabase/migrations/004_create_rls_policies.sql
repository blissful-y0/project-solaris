-- RLS policies

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE abilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE civilian_merits ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- users
CREATE POLICY "users_select_own"
ON users FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "users_select_admin"
ON users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin' AND deleted_at IS NULL
  )
);

CREATE POLICY "users_update_own"
ON users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "users_insert_authenticated"
ON users FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "users_delete_own"
ON users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (deleted_at IS NOT NULL);

-- characters
CREATE POLICY "characters_select_approved"
ON characters FOR SELECT
USING (status = 'approved' AND deleted_at IS NULL);

CREATE POLICY "characters_select_own"
ON characters FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "characters_select_admin"
ON characters FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin' AND deleted_at IS NULL
  )
);

CREATE POLICY "characters_insert_own"
ON characters FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "characters_update_own"
ON characters FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "characters_update_admin"
ON characters FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin' AND deleted_at IS NULL
  )
);

CREATE POLICY "characters_delete_own_or_admin"
ON characters FOR DELETE
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin' AND deleted_at IS NULL
  )
);

-- abilities
CREATE POLICY "abilities_select_approved_character"
ON abilities FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM characters
    WHERE id = abilities.character_id
      AND status = 'approved'
      AND deleted_at IS NULL
  )
  AND deleted_at IS NULL
);

CREATE POLICY "abilities_select_own"
ON abilities FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM characters
    WHERE id = abilities.character_id AND user_id = auth.uid()
  )
);

CREATE POLICY "abilities_select_admin"
ON abilities FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin' AND deleted_at IS NULL
  )
);

CREATE POLICY "abilities_insert_own"
ON abilities FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM characters
    WHERE id = abilities.character_id AND user_id = auth.uid()
  )
);

CREATE POLICY "abilities_update_own"
ON abilities FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM characters
    WHERE id = abilities.character_id AND user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM characters
    WHERE id = abilities.character_id AND user_id = auth.uid()
  )
);

CREATE POLICY "abilities_update_admin"
ON abilities FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin' AND deleted_at IS NULL
  )
);

CREATE POLICY "abilities_delete_own_or_admin"
ON abilities FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM characters
    WHERE id = abilities.character_id AND user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin' AND deleted_at IS NULL
  )
);

-- news
CREATE POLICY "news_select_published"
ON news FOR SELECT
USING (status = 'published' AND deleted_at IS NULL);

CREATE POLICY "news_select_admin"
ON news FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin' AND deleted_at IS NULL
  )
);

CREATE POLICY "news_insert_admin"
ON news FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin' AND deleted_at IS NULL
  )
);

CREATE POLICY "news_update_admin"
ON news FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin' AND deleted_at IS NULL
  )
);

CREATE POLICY "news_delete_admin"
ON news FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin' AND deleted_at IS NULL
  )
)
WITH CHECK (deleted_at IS NOT NULL);

-- news_reactions
CREATE POLICY "news_reactions_select_all"
ON news_reactions FOR SELECT
USING (deleted_at IS NULL);

CREATE POLICY "news_reactions_insert_authenticated"
ON news_reactions FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "news_reactions_delete_own"
ON news_reactions FOR DELETE
USING (user_id = auth.uid());

-- notifications
CREATE POLICY "notifications_select_own"
ON notifications FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "notifications_insert_system"
ON notifications FOR INSERT
WITH CHECK (
  auth.role() = 'service_role'
  OR EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin' AND deleted_at IS NULL
  )
);

CREATE POLICY "notifications_update_own"
ON notifications FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- civilian_merits
CREATE POLICY "civilian_merits_select_all"
ON civilian_merits FOR SELECT
USING (deleted_at IS NULL);

CREATE POLICY "civilian_merits_insert_admin"
ON civilian_merits FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin' AND deleted_at IS NULL
  )
);

CREATE POLICY "civilian_merits_update_admin"
ON civilian_merits FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin' AND deleted_at IS NULL
  )
);

CREATE POLICY "civilian_merits_delete_admin"
ON civilian_merits FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin' AND deleted_at IS NULL
  )
)
WITH CHECK (deleted_at IS NOT NULL);

-- system_settings
CREATE POLICY "system_settings_select_admin"
ON system_settings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin' AND deleted_at IS NULL
  )
);

CREATE POLICY "system_settings_update_admin"
ON system_settings FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin' AND deleted_at IS NULL
  )
);
