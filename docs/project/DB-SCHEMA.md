# PROJECT SOLARIS - Database Schema

**Version:** 1.0  
**Database:** Supabase PostgreSQL  
**ID Strategy:** nanoid(12) generated at application layer  
**Soft Delete:** All tables include `deleted_at timestamptz NULL`

---

## Table of Contents

1. [Core Tables](#core-tables)
   - [users](#1-users)
   - [characters](#2-characters)
   - [abilities](#3-abilities)
2. [Battle System](#battle-system)
   - [battles](#4-battles)
   - [battle_turns](#5-battle_turns)
   - [battle_ooc](#6-battle_ooc)
3. [Room System](#room-system)
   - [rooms](#7-rooms)
   - [room_participants](#8-room_participants)
   - [room_messages](#9-room_messages)
4. [Lore System](#lore-system)
   - [lore_requests](#10-lore_requests)
   - [lore_request_votes](#11-lore_request_votes)
   - [character_lore](#12-character_lore)
5. [News System](#news-system)
   - [news](#13-news)
   - [news_reactions](#14-news_reactions)
6. [Notification System](#notification-system)
   - [notifications](#15-notifications)
7. [Static Data](#static-data)
   - [civilian_merits](#16-civilian_merits)
8. [Indexes](#indexes)
9. [Seed Data](#seed-data)

---

## Core Tables

### 1. users

Supabase Auth 연동 사용자 테이블.

```sql
CREATE TABLE users (
  id text PRIMARY KEY,  -- nanoid(12) or Supabase auth.uid
  discord_id text UNIQUE NOT NULL,
  discord_username text NOT NULL,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  notification_settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);

COMMENT ON TABLE users IS '사용자 계정 정보 (Supabase Auth 연동)';
COMMENT ON COLUMN users.notification_settings IS '알림 설정 JSON: {discord: true, web: true, ...}';
```

#### RLS Policies

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 본인만 자신의 정보 읽기
CREATE POLICY "users_select_own"
ON users FOR SELECT
USING (auth.uid() = id);

-- Admin은 전체 사용자 읽기
CREATE POLICY "users_select_admin"
ON users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin' AND deleted_at IS NULL
  )
);

-- 본인만 자신의 정보 수정
CREATE POLICY "users_update_own"
ON users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 신규 사용자 생성 허용 (앱 레이어에서 제어)
CREATE POLICY "users_insert_authenticated"
ON users FOR INSERT
WITH CHECK (auth.uid() = id);

-- Soft delete: 본인만
CREATE POLICY "users_delete_own"
ON users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (deleted_at IS NOT NULL);
```

---

### 2. characters

계정당 1개의 캐릭터.

```sql
CREATE TABLE characters (
  id text PRIMARY KEY,  -- nanoid(12)
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- 캐릭터 기본 정보
  name text NOT NULL,
  faction text NOT NULL CHECK (faction IN ('bureau', 'static', 'civilian', 'defector')),
  ability_class text NULL CHECK (ability_class IN ('field', 'empathy', 'shift', 'compute')),
  
  -- 스탯
  hp_max integer NOT NULL,
  hp_current integer NOT NULL,
  will_max integer NOT NULL,
  will_current integer NOT NULL,
  
  -- 외형 & 서사
  profile_image_url text NULL,
  appearance text NULL,
  backstory text NULL,
  
  -- 승인 상태
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'revision')),
  rejection_reason text NULL,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  
  UNIQUE(user_id, deleted_at)  -- 계정당 1개 (soft delete 고려)
);

COMMENT ON TABLE characters IS '사용자별 캐릭터 (1인 1캐릭터)';
COMMENT ON COLUMN characters.ability_class IS 'Civilian은 NULL, 능력자는 4가지 클래스 중 택1';
```

#### RLS Policies

```sql
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;

-- 승인된 캐릭터는 전체 공개 읽기
CREATE POLICY "characters_select_approved"
ON characters FOR SELECT
USING (status = 'approved' AND deleted_at IS NULL);

-- 본인 캐릭터는 상태 무관 읽기
CREATE POLICY "characters_select_own"
ON characters FOR SELECT
USING (user_id = auth.uid());

-- Admin은 전체 읽기
CREATE POLICY "characters_select_admin"
ON characters FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin' AND deleted_at IS NULL
  )
);

-- 본인만 자신의 캐릭터 생성
CREATE POLICY "characters_insert_own"
ON characters FOR INSERT
WITH CHECK (user_id = auth.uid());

-- 본인만 수정 (pending/revision 상태일 때만 일부 필드)
CREATE POLICY "characters_update_own"
ON characters FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Admin은 전체 수정 (승인/거부)
CREATE POLICY "characters_update_admin"
ON characters FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin' AND deleted_at IS NULL
  )
);

-- 본인 또는 Admin만 삭제
CREATE POLICY "characters_delete_own_or_admin"
ON characters FOR UPDATE
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin' AND deleted_at IS NULL
  )
)
WITH CHECK (deleted_at IS NOT NULL);
```

---

### 3. abilities

캐릭터당 3개의 능력 (basic/mid/advanced).

```sql
CREATE TABLE abilities (
  id text PRIMARY KEY,  -- nanoid(12)
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
  
  UNIQUE(character_id, tier, deleted_at)  -- 캐릭터당 각 티어별 1개
);

COMMENT ON TABLE abilities IS '캐릭터별 능력 3개 (basic/mid/advanced)';
```

#### RLS Policies

```sql
ALTER TABLE abilities ENABLE ROW LEVEL SECURITY;

-- 승인된 캐릭터의 능력은 전체 공개
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

-- 본인 캐릭터의 능력은 읽기 가능
CREATE POLICY "abilities_select_own"
ON abilities FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM characters
    WHERE id = abilities.character_id AND user_id = auth.uid()
  )
);

-- Admin은 전체 읽기
CREATE POLICY "abilities_select_admin"
ON abilities FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin' AND deleted_at IS NULL
  )
);

-- 본인 캐릭터의 능력만 생성
CREATE POLICY "abilities_insert_own"
ON abilities FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM characters
    WHERE id = abilities.character_id AND user_id = auth.uid()
  )
);

-- 본인 캐릭터의 능력만 수정
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

-- Admin은 전체 수정
CREATE POLICY "abilities_update_admin"
ON abilities FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin' AND deleted_at IS NULL
  )
);

-- 본인 또는 Admin만 삭제
CREATE POLICY "abilities_delete_own_or_admin"
ON abilities FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM characters
    WHERE id = abilities.character_id AND user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin' AND deleted_at IS NULL
  )
)
WITH CHECK (deleted_at IS NOT NULL);
```

---

## Battle System

### 4. battles

전투 게시물 및 세션.

```sql
CREATE TABLE battles (
  id text PRIMARY KEY,  -- nanoid(12)
  
  title text NOT NULL,
  description text NULL,
  
  challenger_id text NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  defender_id text NULL REFERENCES characters(id) ON DELETE SET NULL,
  
  status text NOT NULL DEFAULT 'open' CHECK (
    status IN ('open', 'accepted', 'in_progress', 'paused', 'completed', 'cancelled')
  ),
  
  current_turn text NULL CHECK (current_turn IN ('challenger', 'defender')),
  turn_number integer NOT NULL DEFAULT 0,
  turn_deadline timestamptz NULL,  -- 10분 타임아웃
  
  result jsonb NULL,  -- {winner_id, hp_final: {}, reason, ...}
  pause_requested_by text NULL REFERENCES characters(id),
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);

COMMENT ON TABLE battles IS '전투 게시물 및 세션';
COMMENT ON COLUMN battles.turn_deadline IS '현재 턴 제한 시간 (10분)';
COMMENT ON COLUMN battles.result IS '전투 종료 시 결과 JSON';
```

#### RLS Policies

```sql
ALTER TABLE battles ENABLE ROW LEVEL SECURITY;

-- 전체 공개 읽기 (아카이브 용도)
CREATE POLICY "battles_select_all"
ON battles FOR SELECT
USING (deleted_at IS NULL);

-- 참가자만 전투 생성 (challenger)
CREATE POLICY "battles_insert_challenger"
ON battles FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM characters
    WHERE id = battles.challenger_id AND user_id = auth.uid()
  )
);

-- 참가자만 수정 (수락, 턴 진행 등)
CREATE POLICY "battles_update_participants"
ON battles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM characters
    WHERE (id = battles.challenger_id OR id = battles.defender_id)
      AND user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM characters
    WHERE (id = battles.challenger_id OR id = battles.defender_id)
      AND user_id = auth.uid()
  )
);

-- Admin은 전체 수정
CREATE POLICY "battles_update_admin"
ON battles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin' AND deleted_at IS NULL
  )
);

-- 참가자 또는 Admin만 삭제
CREATE POLICY "battles_delete_participants_or_admin"
ON battles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM characters
    WHERE (id = battles.challenger_id OR id = battles.defender_id)
      AND user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin' AND deleted_at IS NULL
  )
)
WITH CHECK (deleted_at IS NOT NULL);
```

---

### 5. battle_turns

전투 턴 로그.

```sql
CREATE TABLE battle_turns (
  id text PRIMARY KEY,  -- nanoid(12)
  battle_id text NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
  turn_number integer NOT NULL,
  
  -- 공격자
  attacker_id text NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  attacker_text text NOT NULL,
  attacker_submitted_at timestamptz NULL,
  attacker_edited boolean NOT NULL DEFAULT false,
  attacker_agreed boolean NOT NULL DEFAULT false,
  
  -- 방어자
  defender_id text NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  defender_text text NULL,
  defender_submitted_at timestamptz NULL,
  defender_edited boolean NOT NULL DEFAULT false,
  defender_agreed boolean NOT NULL DEFAULT false,
  
  -- GM 판정
  gm_judgment text NULL,
  hp_changes jsonb NULL,  -- {challenger_id: -10, defender_id: 0}
  will_changes jsonb NULL,  -- {challenger_id: -20, defender_id: -5}
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  
  UNIQUE(battle_id, turn_number, deleted_at)
);

COMMENT ON TABLE battle_turns IS '전투 턴별 로그';
COMMENT ON COLUMN battle_turns.gm_judgment IS 'AI GM 판정 결과';
```

#### RLS Policies

```sql
ALTER TABLE battle_turns ENABLE ROW LEVEL SECURITY;

-- 전체 공개 읽기
CREATE POLICY "battle_turns_select_all"
ON battle_turns FOR SELECT
USING (deleted_at IS NULL);

-- 참가자만 턴 생성
CREATE POLICY "battle_turns_insert_participants"
ON battle_turns FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM characters
    WHERE (id = battle_turns.attacker_id OR id = battle_turns.defender_id)
      AND user_id = auth.uid()
  )
);

-- 참가자만 자신의 턴 수정
CREATE POLICY "battle_turns_update_participants"
ON battle_turns FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM characters
    WHERE (id = battle_turns.attacker_id OR id = battle_turns.defender_id)
      AND user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM characters
    WHERE (id = battle_turns.attacker_id OR id = battle_turns.defender_id)
      AND user_id = auth.uid()
  )
);

-- Admin은 전체 수정 (GM 판정)
CREATE POLICY "battle_turns_update_admin"
ON battle_turns FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin' AND deleted_at IS NULL
  )
);
```

---

### 6. battle_ooc

전투 OOC 채팅.

```sql
CREATE TABLE battle_ooc (
  id text PRIMARY KEY,  -- nanoid(12)
  battle_id text NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
  character_id text NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  message text NOT NULL,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);

COMMENT ON TABLE battle_ooc IS '전투 OOC(Out of Character) 채팅';
```

#### RLS Policies

```sql
ALTER TABLE battle_ooc ENABLE ROW LEVEL SECURITY;

-- 전체 공개 읽기
CREATE POLICY "battle_ooc_select_all"
ON battle_ooc FOR SELECT
USING (deleted_at IS NULL);

-- 참가자만 메시지 작성
CREATE POLICY "battle_ooc_insert_participants"
ON battle_ooc FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM battles b
    JOIN characters c ON (b.challenger_id = c.id OR b.defender_id = c.id)
    WHERE b.id = battle_ooc.battle_id
      AND c.id = battle_ooc.character_id
      AND c.user_id = auth.uid()
  )
);

-- 본인 메시지만 수정
CREATE POLICY "battle_ooc_update_own"
ON battle_ooc FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM characters
    WHERE id = battle_ooc.character_id AND user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM characters
    WHERE id = battle_ooc.character_id AND user_id = auth.uid()
  )
);

-- 본인 또는 Admin만 삭제
CREATE POLICY "battle_ooc_delete_own_or_admin"
ON battle_ooc FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM characters
    WHERE id = battle_ooc.character_id AND user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin' AND deleted_at IS NULL
  )
)
WITH CHECK (deleted_at IS NOT NULL);
```

---

## Room System

### 7. rooms

일반 RP 방.

```sql
CREATE TABLE rooms (
  id text PRIMARY KEY,  -- nanoid(12)
  title text NOT NULL,
  description text NULL,
  created_by text NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);

COMMENT ON TABLE rooms IS '일반 RP 방';
```

#### RLS Policies

```sql
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- 참가자만 읽기
CREATE POLICY "rooms_select_participants"
ON rooms FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM room_participants rp
    JOIN characters c ON rp.character_id = c.id
    WHERE rp.room_id = rooms.id
      AND c.user_id = auth.uid()
      AND rp.deleted_at IS NULL
  )
  AND deleted_at IS NULL
);

-- Admin은 전체 읽기
CREATE POLICY "rooms_select_admin"
ON rooms FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin' AND deleted_at IS NULL
  )
);

-- 인증된 사용자는 방 생성 가능
CREATE POLICY "rooms_insert_authenticated"
ON rooms FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM characters
    WHERE id = rooms.created_by AND user_id = auth.uid()
  )
);

-- 방장만 수정
CREATE POLICY "rooms_update_creator"
ON rooms FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM characters
    WHERE id = rooms.created_by AND user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM characters
    WHERE id = rooms.created_by AND user_id = auth.uid()
  )
);

-- Admin은 전체 수정
CREATE POLICY "rooms_update_admin"
ON rooms FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin' AND deleted_at IS NULL
  )
);

-- 방장 또는 Admin만 삭제
CREATE POLICY "rooms_delete_creator_or_admin"
ON rooms FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM characters
    WHERE id = rooms.created_by AND user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin' AND deleted_at IS NULL
  )
)
WITH CHECK (deleted_at IS NOT NULL);
```

---

### 8. room_participants

방 참가자.

```sql
CREATE TABLE room_participants (
  id text PRIMARY KEY,  -- nanoid(12)
  room_id text NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  character_id text NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  
  joined_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  
  UNIQUE(room_id, character_id, deleted_at)
);

COMMENT ON TABLE room_participants IS '방 참가자 목록';
```

#### RLS Policies

```sql
ALTER TABLE room_participants ENABLE ROW LEVEL SECURITY;

-- 참가자는 같은 방의 참가자 목록 읽기
CREATE POLICY "room_participants_select_same_room"
ON room_participants FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM room_participants rp
    JOIN characters c ON rp.character_id = c.id
    WHERE rp.room_id = room_participants.room_id
      AND c.user_id = auth.uid()
      AND rp.deleted_at IS NULL
  )
  AND deleted_at IS NULL
);

-- 방장 또는 본인만 참가자 추가
CREATE POLICY "room_participants_insert_creator_or_self"
ON room_participants FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM rooms r
    JOIN characters c ON r.created_by = c.id
    WHERE r.id = room_participants.room_id
      AND c.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM characters
    WHERE id = room_participants.character_id AND user_id = auth.uid()
  )
);

-- 방장 또는 본인만 퇴장 (soft delete)
CREATE POLICY "room_participants_delete_creator_or_self"
ON room_participants FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM rooms r
    JOIN characters c ON r.created_by = c.id
    WHERE r.id = room_participants.room_id
      AND c.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM characters
    WHERE id = room_participants.character_id AND user_id = auth.uid()
  )
)
WITH CHECK (deleted_at IS NOT NULL);
```

---

### 9. room_messages

RP 메시지.

```sql
CREATE TABLE room_messages (
  id text PRIMARY KEY,  -- nanoid(12)
  room_id text NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  character_id text NULL REFERENCES characters(id) ON DELETE SET NULL,
  message text NOT NULL,
  is_system boolean NOT NULL DEFAULT false,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);

COMMENT ON TABLE room_messages IS 'RP 방 메시지 (character_id NULL이면 시스템 메시지)';
```

#### RLS Policies

```sql
ALTER TABLE room_messages ENABLE ROW LEVEL SECURITY;

-- 참가자만 읽기
CREATE POLICY "room_messages_select_participants"
ON room_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM room_participants rp
    JOIN characters c ON rp.character_id = c.id
    WHERE rp.room_id = room_messages.room_id
      AND c.user_id = auth.uid()
      AND rp.deleted_at IS NULL
  )
  AND deleted_at IS NULL
);

-- 참가자만 메시지 작성
CREATE POLICY "room_messages_insert_participants"
ON room_messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM room_participants rp
    JOIN characters c ON rp.character_id = c.id
    WHERE rp.room_id = room_messages.room_id
      AND c.id = room_messages.character_id
      AND c.user_id = auth.uid()
      AND rp.deleted_at IS NULL
  )
  OR
  (room_messages.is_system = true AND EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ))
);

-- 본인 메시지만 수정
CREATE POLICY "room_messages_update_own"
ON room_messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM characters
    WHERE id = room_messages.character_id AND user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM characters
    WHERE id = room_messages.character_id AND user_id = auth.uid()
  )
);

-- 본인 또는 Admin만 삭제
CREATE POLICY "room_messages_delete_own_or_admin"
ON room_messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM characters
    WHERE id = room_messages.character_id AND user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin' AND deleted_at IS NULL
  )
)
WITH CHECK (deleted_at IS NOT NULL);
```

---

## Lore System

### 10. lore_requests

서사 반영 요청.

```sql
CREATE TABLE lore_requests (
  id text PRIMARY KEY,  -- nanoid(12)
  room_id text NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  requested_by text NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  
  message_range_start text NOT NULL,  -- room_messages.id
  message_range_end text NOT NULL,    -- room_messages.id
  
  status text NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'approved', 'rejected')
  ),
  ai_summary text NULL,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);

COMMENT ON TABLE lore_requests IS '서사 반영 요청 (방 참가자 투표 필요)';
COMMENT ON COLUMN lore_requests.ai_summary IS 'AI가 생성한 서사 요약';
```

#### RLS Policies

```sql
ALTER TABLE lore_requests ENABLE ROW LEVEL SECURITY;

-- 같은 방 참가자만 읽기
CREATE POLICY "lore_requests_select_participants"
ON lore_requests FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM room_participants rp
    JOIN characters c ON rp.character_id = c.id
    WHERE rp.room_id = lore_requests.room_id
      AND c.user_id = auth.uid()
      AND rp.deleted_at IS NULL
  )
  AND deleted_at IS NULL
);

-- 방 참가자만 요청 생성
CREATE POLICY "lore_requests_insert_participants"
ON lore_requests FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM room_participants rp
    JOIN characters c ON rp.character_id = c.id
    WHERE rp.room_id = lore_requests.room_id
      AND c.id = lore_requests.requested_by
      AND c.user_id = auth.uid()
      AND rp.deleted_at IS NULL
  )
);

-- Admin은 승인/거부 가능
CREATE POLICY "lore_requests_update_admin"
ON lore_requests FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin' AND deleted_at IS NULL
  )
);

-- 요청자 또는 Admin만 삭제
CREATE POLICY "lore_requests_delete_requester_or_admin"
ON lore_requests FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM characters
    WHERE id = lore_requests.requested_by AND user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin' AND deleted_at IS NULL
  )
)
WITH CHECK (deleted_at IS NOT NULL);
```

---

### 11. lore_request_votes

서사 반영 동의 투표.

```sql
CREATE TABLE lore_request_votes (
  id text PRIMARY KEY,  -- nanoid(12)
  lore_request_id text NOT NULL REFERENCES lore_requests(id) ON DELETE CASCADE,
  character_id text NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  agreed boolean NOT NULL,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  
  UNIQUE(lore_request_id, character_id, deleted_at)
);

COMMENT ON TABLE lore_request_votes IS '서사 반영 요청에 대한 참가자 동의 투표';
```

#### RLS Policies

```sql
ALTER TABLE lore_request_votes ENABLE ROW LEVEL SECURITY;

-- 같은 방 참가자만 읽기
CREATE POLICY "lore_request_votes_select_participants"
ON lore_request_votes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM lore_requests lr
    JOIN room_participants rp ON lr.room_id = rp.room_id
    JOIN characters c ON rp.character_id = c.id
    WHERE lr.id = lore_request_votes.lore_request_id
      AND c.user_id = auth.uid()
      AND rp.deleted_at IS NULL
  )
  AND deleted_at IS NULL
);

-- 방 참가자만 투표
CREATE POLICY "lore_request_votes_insert_participants"
ON lore_request_votes FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM lore_requests lr
    JOIN room_participants rp ON lr.room_id = rp.room_id
    JOIN characters c ON rp.character_id = c.id
    WHERE lr.id = lore_request_votes.lore_request_id
      AND c.id = lore_request_votes.character_id
      AND c.user_id = auth.uid()
      AND rp.deleted_at IS NULL
  )
);

-- 본인 투표만 수정
CREATE POLICY "lore_request_votes_update_own"
ON lore_request_votes FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM characters
    WHERE id = lore_request_votes.character_id AND user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM characters
    WHERE id = lore_request_votes.character_id AND user_id = auth.uid()
  )
);
```

---

### 12. character_lore

캐릭터 서사 타임라인.

```sql
CREATE TABLE character_lore (
  id text PRIMARY KEY,  -- nanoid(12)
  character_id text NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  
  source_type text NOT NULL CHECK (source_type IN ('battle', 'room', 'admin')),
  source_id text NULL,  -- battles.id or rooms.id
  summary text NOT NULL,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);

COMMENT ON TABLE character_lore IS '캐릭터 서사 타임라인 (승인된 lore_request에서 자동 생성)';
```

#### RLS Policies

```sql
ALTER TABLE character_lore ENABLE ROW LEVEL SECURITY;

-- 승인된 캐릭터의 서사는 전체 공개
CREATE POLICY "character_lore_select_approved"
ON character_lore FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM characters
    WHERE id = character_lore.character_id
      AND status = 'approved'
      AND deleted_at IS NULL
  )
  AND deleted_at IS NULL
);

-- 본인 캐릭터의 서사는 읽기 가능
CREATE POLICY "character_lore_select_own"
ON character_lore FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM characters
    WHERE id = character_lore.character_id AND user_id = auth.uid()
  )
);

-- Admin만 생성/수정/삭제
CREATE POLICY "character_lore_insert_admin"
ON character_lore FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin' AND deleted_at IS NULL
  )
);

CREATE POLICY "character_lore_update_admin"
ON character_lore FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin' AND deleted_at IS NULL
  )
);

CREATE POLICY "character_lore_delete_admin"
ON character_lore FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin' AND deleted_at IS NULL
  )
)
WITH CHECK (deleted_at IS NOT NULL);
```

---

## News System

### 13. news

도시 뉴스.

```sql
CREATE TABLE news (
  id text PRIMARY KEY,  -- nanoid(12)
  bulletin_number integer UNIQUE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  source_type text NOT NULL CHECK (source_type IN ('auto', 'manual', 'battle')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);

COMMENT ON TABLE news IS '도시 뉴스 (전체 공개)';
COMMENT ON COLUMN news.bulletin_number IS '뉴스 고유 번호 (자동 증가)';
```

#### RLS Policies

```sql
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- Published 뉴스는 전체 공개 읽기
CREATE POLICY "news_select_published"
ON news FOR SELECT
USING (status = 'published' AND deleted_at IS NULL);

-- Admin은 전체 읽기 (draft 포함)
CREATE POLICY "news_select_admin"
ON news FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin' AND deleted_at IS NULL
  )
);

-- Admin만 생성/수정/삭제
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
```

---

### 14. news_reactions

뉴스 리액션.

```sql
CREATE TABLE news_reactions (
  id text PRIMARY KEY,  -- nanoid(12)
  news_id text NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emoji text NOT NULL,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  
  UNIQUE(news_id, user_id, emoji, deleted_at)
);

COMMENT ON TABLE news_reactions IS '뉴스 리액션 (사용자별 이모지)';
```

#### RLS Policies

```sql
ALTER TABLE news_reactions ENABLE ROW LEVEL SECURITY;

-- 전체 공개 읽기
CREATE POLICY "news_reactions_select_all"
ON news_reactions FOR SELECT
USING (deleted_at IS NULL);

-- 인증된 사용자만 리액션 추가
CREATE POLICY "news_reactions_insert_authenticated"
ON news_reactions FOR INSERT
WITH CHECK (user_id = auth.uid());

-- 본인 리액션만 삭제
CREATE POLICY "news_reactions_delete_own"
ON news_reactions FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (deleted_at IS NOT NULL);
```

---

## Notification System

### 15. notifications

알림 로그.

```sql
CREATE TABLE notifications (
  id text PRIMARY KEY,  -- nanoid(12)
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  type text NOT NULL,  -- 'battle_invite', 'lore_approved', 'news_published', etc.
  title text NOT NULL,
  body text NULL,
  deep_link text NULL,  -- 앱 내 이동 경로
  
  sent_via text NOT NULL CHECK (sent_via IN ('discord', 'web', 'both')),
  read boolean NOT NULL DEFAULT false,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);

COMMENT ON TABLE notifications IS '사용자별 알림 로그';
```

#### RLS Policies

```sql
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 본인 알림만 읽기
CREATE POLICY "notifications_select_own"
ON notifications FOR SELECT
USING (user_id = auth.uid() AND deleted_at IS NULL);

-- 시스템(Admin)만 생성
CREATE POLICY "notifications_insert_system"
ON notifications FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin' AND deleted_at IS NULL
  )
);

-- 본인 알림만 수정 (읽음 처리)
CREATE POLICY "notifications_update_own"
ON notifications FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 본인 알림만 삭제
CREATE POLICY "notifications_delete_own"
ON notifications FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (deleted_at IS NOT NULL);
```

---

## Static Data

### 16. civilian_merits

비능력자 메리트 (정적 시드 데이터).

```sql
CREATE TABLE civilian_merits (
  id text PRIMARY KEY,  -- nanoid(12)
  name text UNIQUE NOT NULL,
  description text NOT NULL,
  effect text NOT NULL,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);

COMMENT ON TABLE civilian_merits IS '비능력자 메리트 5개 (정적 데이터)';
```

#### RLS Policies

```sql
ALTER TABLE civilian_merits ENABLE ROW LEVEL SECURITY;

-- 전체 공개 읽기
CREATE POLICY "civilian_merits_select_all"
ON civilian_merits FOR SELECT
USING (deleted_at IS NULL);

-- Admin만 생성/수정/삭제
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
```

---

## Indexes

성능 최적화를 위한 인덱스.

```sql
-- users
CREATE INDEX idx_users_discord_id ON users(discord_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role ON users(role) WHERE deleted_at IS NULL;

-- characters
CREATE INDEX idx_characters_user_id ON characters(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_characters_status ON characters(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_characters_faction ON characters(faction) WHERE deleted_at IS NULL;

-- abilities
CREATE INDEX idx_abilities_character_id ON abilities(character_id) WHERE deleted_at IS NULL;

-- battles
CREATE INDEX idx_battles_challenger_id ON battles(challenger_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_battles_defender_id ON battles(defender_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_battles_status ON battles(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_battles_turn_deadline ON battles(turn_deadline) WHERE status IN ('in_progress', 'paused') AND deleted_at IS NULL;

-- battle_turns
CREATE INDEX idx_battle_turns_battle_id ON battle_turns(battle_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_battle_turns_turn_number ON battle_turns(battle_id, turn_number) WHERE deleted_at IS NULL;

-- battle_ooc
CREATE INDEX idx_battle_ooc_battle_id ON battle_ooc(battle_id) WHERE deleted_at IS NULL;

-- rooms
CREATE INDEX idx_rooms_status ON rooms(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_rooms_created_by ON rooms(created_by) WHERE deleted_at IS NULL;

-- room_participants
CREATE INDEX idx_room_participants_room_id ON room_participants(room_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_room_participants_character_id ON room_participants(character_id) WHERE deleted_at IS NULL;

-- room_messages
CREATE INDEX idx_room_messages_room_id ON room_messages(room_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_room_messages_created_at ON room_messages(room_id, created_at DESC) WHERE deleted_at IS NULL;

-- lore_requests
CREATE INDEX idx_lore_requests_room_id ON lore_requests(room_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_lore_requests_status ON lore_requests(status) WHERE deleted_at IS NULL;

-- lore_request_votes
CREATE INDEX idx_lore_request_votes_lore_request_id ON lore_request_votes(lore_request_id) WHERE deleted_at IS NULL;

-- character_lore
CREATE INDEX idx_character_lore_character_id ON character_lore(character_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_character_lore_created_at ON character_lore(character_id, created_at DESC) WHERE deleted_at IS NULL;

-- news
CREATE INDEX idx_news_status ON news(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_news_bulletin_number ON news(bulletin_number) WHERE deleted_at IS NULL;
CREATE INDEX idx_news_created_at ON news(created_at DESC) WHERE status = 'published' AND deleted_at IS NULL;

-- news_reactions
CREATE INDEX idx_news_reactions_news_id ON news_reactions(news_id) WHERE deleted_at IS NULL;

-- notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_notifications_read ON notifications(user_id, read) WHERE deleted_at IS NULL;
CREATE INDEX idx_notifications_created_at ON notifications(user_id, created_at DESC) WHERE deleted_at IS NULL;
```

---

## Seed Data

### 진영별 초기 스탯

```sql
-- Application 레이어에서 캐릭터 생성 시 참조할 초기값
-- (DB에 저장하지 않고 앱 로직에서 처리)

/*
Faction Initial Stats:
- bureau:   HP 80,  WILL 250
- static:   HP 120, WILL 150
- civilian: HP 100, WILL 100
- defector: HP 100, WILL 200
*/
```

### 비능력자 메리트 (civilian_merits)

```sql
-- 5가지 비능력자 메리트 시드 데이터
INSERT INTO civilian_merits (id, name, description, effect) VALUES
  ('merit_001', '전술적 통찰력', '전투 경험과 전략적 사고를 통해 상황을 빠르게 파악합니다.', 'WILL 소모 -10% (전투 시)'),
  ('merit_002', '정신적 회복력', '강한 정신력으로 의지를 빠르게 회복합니다.', 'WILL 회복 +20% (휴식 시)'),
  ('merit_003', '신체 강건함', '강화된 체력으로 더 많은 피해를 견딥니다.', 'HP +20 (최대값)'),
  ('merit_004', '임기응변', '예측 불가능한 상황에서 빠르게 대응합니다.', '첫 턴 행동 우선권 획득'),
  ('merit_005', '전문 장비 숙련', '특수 장비를 효율적으로 사용할 수 있습니다.', '장비 아이템 효과 +30%')
ON CONFLICT (id) DO NOTHING;
```

---

## Triggers & Functions

### Updated_at 자동 갱신

```sql
-- updated_at 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 모든 테이블에 트리거 적용
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_characters_updated_at BEFORE UPDATE ON characters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_abilities_updated_at BEFORE UPDATE ON abilities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_battles_updated_at BEFORE UPDATE ON battles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_battle_turns_updated_at BEFORE UPDATE ON battle_turns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_battle_ooc_updated_at BEFORE UPDATE ON battle_ooc
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_room_participants_updated_at BEFORE UPDATE ON room_participants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_room_messages_updated_at BEFORE UPDATE ON room_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lore_requests_updated_at BEFORE UPDATE ON lore_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lore_request_votes_updated_at BEFORE UPDATE ON lore_request_votes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_character_lore_updated_at BEFORE UPDATE ON character_lore
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_reactions_updated_at BEFORE UPDATE ON news_reactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_civilian_merits_updated_at BEFORE UPDATE ON civilian_merits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 뉴스 Bulletin Number 자동 증가

```sql
-- 뉴스 생성 시 bulletin_number 자동 증가
CREATE OR REPLACE FUNCTION set_news_bulletin_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.bulletin_number IS NULL THEN
    SELECT COALESCE(MAX(bulletin_number), 0) + 1 INTO NEW.bulletin_number FROM news;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_news_bulletin_number_trigger
BEFORE INSERT ON news
FOR EACH ROW
EXECUTE FUNCTION set_news_bulletin_number();
```

---

## Application Layer Notes

### 1. ID 생성

앱 레이어에서 모든 테이블의 `id`를 nanoid(12)로 생성 후 INSERT.

```typescript
import { nanoid } from 'nanoid';

const newId = nanoid(12); // 예: "V1StGXR8_Z5j"
```

### 2. Soft Delete

모든 DELETE 작업은 `deleted_at`을 현재 timestamp로 UPDATE.

```sql
UPDATE characters SET deleted_at = now() WHERE id = 'xxx';
```

### 3. RLS 활성화 확인

Supabase 대시보드에서 모든 테이블의 RLS가 활성화되었는지 확인.

### 4. 진영별 초기 스탯

캐릭터 생성 시 `faction`에 따라 `hp_max`, `hp_current`, `will_max`, `will_current` 자동 설정.

### 5. 전투 타임아웃

`battles.turn_deadline`을 기준으로 10분 타임아웃 체크. 앱 레이어에서 Cron Job 또는 Realtime Subscription으로 처리.

---

## Migration Script

전체 스키마를 한번에 실행할 수 있는 마이그레이션 스크립트.

```sql
-- Enable UUID extension (optional, for auth.uid())
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Execute all CREATE TABLE statements above
-- Execute all ALTER TABLE ... ENABLE ROW LEVEL SECURITY statements
-- Execute all CREATE POLICY statements
-- Execute all CREATE INDEX statements
-- Execute all CREATE TRIGGER statements
-- Execute seed data INSERT statements
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-17 | Initial schema design |
| 1.1 | 2026-02-17 | Added faction_posts, faction_comments, ticker_entries, character_relationships |

---

## Additional Tables (v1.1)

### 17. faction_posts — 진영별 기밀 게시판

```sql
CREATE TABLE faction_posts (
  id text PRIMARY KEY,                -- nanoid(12)
  faction text NOT NULL CHECK (faction IN ('bureau', 'static')),
  author_id text REFERENCES characters(id),  -- NULL이면 시스템 자동 생성
  title text NOT NULL,
  content text NOT NULL,
  is_pinned boolean DEFAULT false,
  source_type text DEFAULT 'manual' CHECK (source_type IN ('manual', 'auto', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

CREATE INDEX idx_faction_posts_faction ON faction_posts(faction) WHERE deleted_at IS NULL;
CREATE INDEX idx_faction_posts_pinned ON faction_posts(faction, is_pinned, created_at DESC) WHERE deleted_at IS NULL;
```

**RLS:**
```sql
-- SELECT: 같은 진영 캐릭터만 (civilian/defector는 static으로 간주)
CREATE POLICY "faction_posts_select" ON faction_posts FOR SELECT USING (
  deleted_at IS NULL AND (
    EXISTS (
      SELECT 1 FROM characters c
      WHERE c.user_id = auth.uid()
        AND c.deleted_at IS NULL
        AND c.status = 'approved'
        AND (
          (faction_posts.faction = 'bureau' AND c.faction = 'bureau')
          OR (faction_posts.faction = 'static' AND c.faction IN ('static', 'civilian', 'defector'))
        )
    )
    OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  )
);

-- INSERT: 같은 진영 승인 캐릭터만
CREATE POLICY "faction_posts_insert" ON faction_posts FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM characters c
    WHERE c.user_id = auth.uid()
      AND c.deleted_at IS NULL
      AND c.status = 'approved'
      AND (
        (faction = 'bureau' AND c.faction = 'bureau')
        OR (faction = 'static' AND c.faction IN ('static', 'civilian', 'defector'))
      )
  )
);

-- UPDATE/DELETE: 본인 게시물만 또는 admin
CREATE POLICY "faction_posts_update" ON faction_posts FOR UPDATE USING (
  EXISTS (SELECT 1 FROM characters c WHERE c.id = faction_posts.author_id AND c.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
);
```

### 18. faction_comments — 기밀 게시판 댓글

```sql
CREATE TABLE faction_comments (
  id text PRIMARY KEY,
  post_id text NOT NULL REFERENCES faction_posts(id),
  author_id text NOT NULL REFERENCES characters(id),
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

CREATE INDEX idx_faction_comments_post ON faction_comments(post_id, created_at) WHERE deleted_at IS NULL;
```

**RLS:** faction_posts와 동일한 진영 기반 접근 제어.

### 19. ticker_entries — Solaris Ticker (실시간 시보)

```sql
CREATE TABLE ticker_entries (
  id text PRIMARY KEY,
  content text NOT NULL,              -- "보안국 제3구역 검문 강화"
  source_type text DEFAULT 'auto' CHECK (source_type IN ('auto', 'battle', 'admin')),
  source_id text,                     -- battle.id 등 연결
  created_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

CREATE INDEX idx_ticker_entries_recent ON ticker_entries(created_at DESC) WHERE deleted_at IS NULL;
```

**RLS:**
```sql
-- SELECT: 모든 인증 유저
CREATE POLICY "ticker_select" ON ticker_entries FOR SELECT USING (
  deleted_at IS NULL AND auth.uid() IS NOT NULL
);

-- INSERT/UPDATE/DELETE: admin만
CREATE POLICY "ticker_admin" ON ticker_entries FOR ALL USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
);
```

### 20. character_relationships — 캐릭터 관계도

```sql
CREATE TABLE character_relationships (
  id text PRIMARY KEY,
  character_id text NOT NULL REFERENCES characters(id),   -- 관계를 등록한 캐릭터
  target_id text NOT NULL REFERENCES characters(id),      -- 대상 캐릭터
  label text NOT NULL,                                      -- "동맹", "경계 중", "원수" 등
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(character_id, target_id)
);

CREATE INDEX idx_char_rel_character ON character_relationships(character_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_char_rel_target ON character_relationships(target_id) WHERE deleted_at IS NULL;
```

**RLS:**
```sql
-- SELECT: 승인된 캐릭터 보유 유저 전체 읽기
CREATE POLICY "relationships_select" ON character_relationships FOR SELECT USING (
  deleted_at IS NULL AND EXISTS (
    SELECT 1 FROM characters c WHERE c.user_id = auth.uid() AND c.status = 'approved' AND c.deleted_at IS NULL
  )
);

-- INSERT/UPDATE/DELETE: 본인 캐릭터의 관계만
CREATE POLICY "relationships_modify" ON character_relationships FOR ALL USING (
  EXISTS (
    SELECT 1 FROM characters c
    WHERE c.id = character_relationships.character_id
      AND c.user_id = auth.uid()
      AND c.deleted_at IS NULL
  )
);
```

---

**End of Schema Document**
