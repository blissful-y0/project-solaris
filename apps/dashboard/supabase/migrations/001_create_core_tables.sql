-- Core tables: users, characters, abilities

CREATE TABLE users (
  id uuid PRIMARY KEY,
  discord_id text UNIQUE NOT NULL,
  discord_username text NOT NULL,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  notification_settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);

COMMENT ON TABLE users IS '사용자 계정 정보 (Supabase Auth 연동)';
COMMENT ON COLUMN users.notification_settings IS '알림 설정 JSON';

CREATE TABLE characters (
  id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  faction text NOT NULL CHECK (faction IN ('bureau', 'static', 'civilian', 'defector')),
  ability_class text NULL CHECK (ability_class IN ('field', 'empathy', 'shift', 'compute')),
  hp_max integer NOT NULL CHECK (hp_max > 0),
  hp_current integer NOT NULL CHECK (hp_current >= 0),
  will_max integer NOT NULL CHECK (will_max > 0),
  will_current integer NOT NULL CHECK (will_current >= 0),
  profile_image_url text NULL,
  profile_data jsonb NULL,
  appearance text NULL,
  backstory text NULL,
  leader_application boolean NOT NULL DEFAULT false,
  is_leader boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  CHECK ((faction = 'civilian' AND ability_class IS NULL) OR (faction <> 'civilian' AND ability_class IS NOT NULL))
);

COMMENT ON TABLE characters IS '사용자별 캐릭터 (1인 1캐릭터)';
COMMENT ON COLUMN characters.ability_class IS 'Civilian은 NULL, 능력자는 4가지 클래스 중 택1';

CREATE TABLE abilities (
  id text PRIMARY KEY,
  character_id text NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  tier text NOT NULL CHECK (tier IN ('basic', 'mid', 'advanced')),
  name text NOT NULL,
  description text NOT NULL,
  weakness text NULL,
  cost_type text NOT NULL CHECK (cost_type IN ('will', 'hp')),
  cost_amount integer NOT NULL CHECK (cost_amount >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  UNIQUE(character_id, tier, deleted_at)
);

COMMENT ON TABLE abilities IS '캐릭터별 능력 3개 (basic/mid/advanced)';
