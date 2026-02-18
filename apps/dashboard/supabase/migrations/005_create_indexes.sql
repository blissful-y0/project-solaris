-- Indexes

-- users
CREATE INDEX idx_users_discord_id ON users(discord_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role ON users(role) WHERE deleted_at IS NULL;

-- characters
CREATE INDEX idx_characters_user_id ON characters(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_characters_status ON characters(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_characters_faction ON characters(faction) WHERE deleted_at IS NULL;

-- 유저당 활성 캐릭터 1개
CREATE UNIQUE INDEX uq_characters_user_active
  ON characters (user_id)
  WHERE deleted_at IS NULL;

-- 진영별 리더 1명
CREATE UNIQUE INDEX uq_leader_bureau
  ON characters (faction)
  WHERE faction = 'bureau' AND is_leader = true AND deleted_at IS NULL;

CREATE UNIQUE INDEX uq_leader_static
  ON characters (faction)
  WHERE faction = 'static' AND is_leader = true AND deleted_at IS NULL;

-- abilities
CREATE INDEX idx_abilities_character_id ON abilities(character_id) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX uq_abilities_character_tier_active
  ON abilities(character_id, tier)
  WHERE deleted_at IS NULL;

-- news
CREATE INDEX idx_news_status ON news(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_news_bulletin_number ON news(bulletin_number) WHERE deleted_at IS NULL;
CREATE INDEX idx_news_created_at ON news(created_at DESC) WHERE status = 'published' AND deleted_at IS NULL;

-- news_reactions
CREATE INDEX idx_news_reactions_news_id ON news_reactions(news_id) WHERE deleted_at IS NULL;

-- notifications
CREATE INDEX idx_notifications_user_created_at ON notifications(user_id, created_at DESC) WHERE user_id IS NOT NULL;
CREATE INDEX idx_notifications_scope_created_at ON notifications(scope, created_at DESC);
CREATE INDEX idx_notifications_delivery_status_created_at ON notifications(delivery_status, created_at);
