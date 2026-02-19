# Auth — 인증/세션 관리

> Discord OAuth 로그인, 세션 관리.

---

## 화면 (프론트엔드)

### 로그인 (`/login`)
- Discord OAuth 버튼 1개
- 미인증 유저는 `/login`으로 리다이렉트
- 인증 후 `/dashboard`로 이동

### 세션 관리
- `@supabase/ssr` 쿠키 세션 (PKCE flow)
- 미들웨어에서 세션 갱신 + 리다이렉트
- `/api/auth/callback`에서 OAuth code→세션 교환 + open redirect 방어

---

## API (백엔드)

### POST /api/auth/callback
Discord OAuth 콜백 처리 및 세션 생성

**인증**: 불필요

**Request Query**: `code` (Discord OAuth code)

**Response 200**
```json
{
  "user": {
    "id": "a1b2c3d4e5f6",
    "discord_id": "123456789012345678",
    "discord_username": "player#1234",
    "role": "user"
  },
  "session": {
    "access_token": "eyJ...",
    "refresh_token": "eyJ...",
    "expires_at": 1706188200
  }
}
```

---

### GET /api/auth/me
현재 인증된 사용자 정보 조회

**인증**: 필수

**Response 200**
```json
{
  "user": {
    "id": "a1b2c3d4e5f6",
    "discord_id": "123456789012345678",
    "discord_username": "player#1234",
    "role": "user"
  },
  "character": {
    "id": "c1d2e3f4g5h6",
    "name": "아리스",
    "faction": "bureau",
    "status": "approved"
  }
}
```

---

## DB 스키마

### users

Supabase Auth 연동 사용자 테이블.

```sql
CREATE TABLE users (
  id text PRIMARY KEY,
  discord_id text UNIQUE NOT NULL,
  discord_username text NOT NULL,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  notification_settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);
```

#### RLS
- 본인만 자신의 정보 읽기/수정
- Admin은 전체 사용자 읽기

### 관련 인덱스

```sql
CREATE INDEX idx_users_discord_id ON users(discord_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role ON users(role) WHERE deleted_at IS NULL;
```
