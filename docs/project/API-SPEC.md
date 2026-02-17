# PROJECT SOLARIS API Specification

## 개요

PROJECT SOLARIS는 도시 배경의 롤플레이 전투 시스템을 제공하는 웹서비스입니다.

### 기술 스택
- **Frontend/Backend**: Next.js 15 App Router
- **Database & Auth**: Supabase (PostgreSQL + Auth + Realtime)
- **Batch Server**: Supabase Edge Functions
- **AI**: 기능별 고정 라우팅 (예: 메인 스토리=Claude Opus, 전투 판정=Gemini Pro)
- **Notification**: Discord Bot

### API 설계 원칙
- **RESTful** 아키텍처
- **인증**: Supabase Auth JWT (Bearer token)
- **ID 형식**: nanoid(12) (예: `a1b2c3d4e5f6`)
- **삭제 방식**: Soft delete (`deleted_at` 필드 업데이트)
- **관리자 API**: `/api/admin/*` 경로
- **에러 응답**: 일관된 JSON 형식
- **AI 모델 선택 단위**: 기능 단위 고정 (`main_story`, `battle_judgment`, `lore_reflection`, `news_generation`)
- **제품 IA v2**: `Home/Lore/Session/REGISTRY/Helios Core/MY` 라벨을 사용한다.

### IA v2 전환 메모 (플래닝 기준)
- `Battle API` + `Rooms API`는 사용자 관점에서 `Sessions API`로 통합 노출한다.
- `World API`(Lore 문서 조회)와 `Core API`(Helios Core 브리핑/타임라인)를 Phase 1 스펙 그룹에 추가한다.
- `Home API`는 개인 상태 + 커뮤니티 요약 제공을 우선한다.
- 기존 `도감` 관련 조회 API는 사용자 노출 이름을 `REGISTRY`로 통일한다.
- 기존 엔드포인트 경로는 하위 호환을 위해 유지 가능하며, 프론트 라우팅/네이밍을 우선 통합한다.

### 공통 헤더
```
Authorization: Bearer {supabase_jwt_token}
Content-Type: application/json
```

### 공통 에러 응답
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

### 에러 코드
- `UNAUTHORIZED`: 인증 실패 (401)
- `FORBIDDEN`: 권한 없음 (403)
- `NOT_FOUND`: 리소스 없음 (404)
- `VALIDATION_ERROR`: 입력 검증 실패 (400)
- `CONFLICT`: 리소스 충돌 (409)
- `INTERNAL_ERROR`: 서버 오류 (500)

---

## Auth API

### POST /api/auth/callback
Discord OAuth 콜백 처리 및 세션 생성

**인증**: 불필요

**Request Query**
```
code: string (Discord OAuth code)
```

**Response 200**
```json
{
  "user": {
    "id": "a1b2c3d4e5f6",
    "discord_id": "123456789012345678",
    "discord_username": "player#1234",
    "avatar_url": "https://cdn.discordapp.com/avatars/...",
    "role": "user",
    "created_at": "2026-01-15T10:30:00Z"
  },
  "session": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_at": 1706188200
  }
}
```

**Response 401**
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid OAuth code"
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
    "avatar_url": "https://cdn.discordapp.com/avatars/...",
    "role": "user",
    "created_at": "2026-01-15T10:30:00Z"
  },
  "character": {
    "id": "c1d2e3f4g5h6",
    "name": "아리스",
    "faction": "lawbringer",
    "status": "approved"
  }
}
```

**Response 401**
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

---

## Characters API

### POST /api/characters
새 캐릭터 생성 (위자드 완료 시)

**인증**: 필수

**Request Body**
```json
{
  "name": "아리스",
  "title": "정의의 수호자",
  "faction": "lawbringer",
  "backstory": "도시의 법과 질서를 지키는 집행관...",
  "appearance": "은발의 여성, 청록색 눈동자...",
  "personality": "냉철하고 이성적이나, 약자에게는 따뜻함...",
  "abilities": [
    {
      "name": "심판의 일격",
      "category": "combat",
      "description": "정의의 힘을 담은 일격을 가한다",
      "cost_type": "stamina",
      "cost_value": 30
    },
    {
      "name": "진실 간파",
      "category": "utility",
      "description": "상대의 거짓을 꿰뚫어본다",
      "cost_type": "focus",
      "cost_value": 20
    }
  ]
}
```

**Response 201**
```json
{
  "character": {
    "id": "c1d2e3f4g5h6",
    "user_id": "a1b2c3d4e5f6",
    "name": "아리스",
    "title": "정의의 수호자",
    "faction": "lawbringer",
    "backstory": "도시의 법과 질서를 지키는 집행관...",
    "appearance": "은발의 여성, 청록색 눈동자...",
    "personality": "냉철하고 이성적이나, 약자에게는 따뜻함...",
    "status": "pending",
    "level": 1,
    "exp": 0,
    "created_at": "2026-02-17T12:00:00Z",
    "updated_at": "2026-02-17T12:00:00Z"
  },
  "abilities": [
    {
      "id": "ab1cd2ef3gh4",
      "character_id": "c1d2e3f4g5h6",
      "name": "심판의 일격",
      "category": "combat",
      "description": "정의의 힘을 담은 일격을 가한다",
      "cost_type": "stamina",
      "cost_value": 30,
      "created_at": "2026-02-17T12:00:00Z"
    },
    {
      "id": "ab2cd3ef4gh5",
      "character_id": "c1d2e3f4g5h6",
      "name": "진실 간파",
      "category": "utility",
      "description": "상대의 거짓을 꿰뚫어본다",
      "cost_type": "focus",
      "cost_value": 20,
      "created_at": "2026-02-17T12:00:00Z"
    }
  ]
}
```

**Response 400**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid character data",
    "details": {
      "name": "Name must be 2-20 characters",
      "abilities": "Must have at least 2 abilities"
    }
  }
}
```

**Response 409**
```json
{
  "error": {
    "code": "CONFLICT",
    "message": "User already has an active character"
  }
}
```

---

### GET /api/characters
캐릭터 목록 조회 (도감)

**인증**: 필수

**Request Query**
```
faction?: string (lawbringer|rogue|neutral)
status?: string (pending|approved|rejected)
page?: number (default: 1)
limit?: number (default: 20, max: 100)
```

**Response 200**
```json
{
  "characters": [
    {
      "id": "c1d2e3f4g5h6",
      "name": "아리스",
      "title": "정의의 수호자",
      "faction": "lawbringer",
      "appearance": "은발의 여성, 청록색 눈동자...",
      "level": 5,
      "status": "approved",
      "user": {
        "id": "a1b2c3d4e5f6",
        "discord_username": "player#1234",
        "avatar_url": "https://cdn.discordapp.com/avatars/..."
      },
      "stats": {
        "battles_won": 12,
        "battles_lost": 3,
        "battles_draw": 1
      },
      "created_at": "2026-01-15T10:30:00Z"
    },
    {
      "id": "c2d3e4f5g6h7",
      "name": "제로",
      "title": "그림자 속의 칼날",
      "faction": "rogue",
      "appearance": "검은 후드를 쓴 남성...",
      "level": 4,
      "status": "approved",
      "user": {
        "id": "b2c3d4e5f6g7",
        "discord_username": "shadow#5678",
        "avatar_url": "https://cdn.discordapp.com/avatars/..."
      },
      "stats": {
        "battles_won": 8,
        "battles_lost": 2,
        "battles_draw": 0
      },
      "created_at": "2026-01-20T14:20:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 47,
    "total_pages": 3
  }
}
```

---

### GET /api/characters/:id
캐릭터 상세 정보 조회

**인증**: 필수

**Response 200**
```json
{
  "character": {
    "id": "c1d2e3f4g5h6",
    "user_id": "a1b2c3d4e5f6",
    "name": "아리스",
    "title": "정의의 수호자",
    "faction": "lawbringer",
    "backstory": "도시의 법과 질서를 지키는 집행관...",
    "appearance": "은발의 여성, 청록색 눈동자...",
    "personality": "냉철하고 이성적이나, 약자에게는 따뜻함...",
    "status": "approved",
    "level": 5,
    "exp": 1250,
    "created_at": "2026-01-15T10:30:00Z",
    "updated_at": "2026-02-10T08:15:00Z"
  },
  "user": {
    "id": "a1b2c3d4e5f6",
    "discord_username": "player#1234",
    "avatar_url": "https://cdn.discordapp.com/avatars/..."
  },
  "abilities": [
    {
      "id": "ab1cd2ef3gh4",
      "name": "심판의 일격",
      "category": "combat",
      "description": "정의의 힘을 담은 일격을 가한다",
      "cost_type": "stamina",
      "cost_value": 30
    },
    {
      "id": "ab2cd3ef4gh5",
      "name": "진실 간파",
      "category": "utility",
      "description": "상대의 거짓을 꿰뚫어본다",
      "cost_type": "focus",
      "cost_value": 20
    }
  ],
  "stats": {
    "battles_total": 16,
    "battles_won": 12,
    "battles_lost": 3,
    "battles_draw": 1,
    "win_rate": 0.75
  },
  "recent_battles": [
    {
      "id": "bt1cd2ef3gh4",
      "opponent": {
        "id": "c2d3e4f5g6h7",
        "name": "제로",
        "faction": "rogue"
      },
      "result": "win",
      "ended_at": "2026-02-15T18:30:00Z"
    }
  ]
}
```

**Response 404**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Character not found"
  }
}
```

---

### PATCH /api/characters/:id
캐릭터 정보 수정 (본인만)

**인증**: 필수 (본인 확인)

**Request Body**
```json
{
  "backstory": "수정된 배경 스토리...",
  "appearance": "수정된 외형 묘사...",
  "personality": "수정된 성격..."
}
```

**Response 200**
```json
{
  "character": {
    "id": "c1d2e3f4g5h6",
    "user_id": "a1b2c3d4e5f6",
    "name": "아리스",
    "title": "정의의 수호자",
    "faction": "lawbringer",
    "backstory": "수정된 배경 스토리...",
    "appearance": "수정된 외형 묘사...",
    "personality": "수정된 성격...",
    "status": "approved",
    "level": 5,
    "exp": 1250,
    "updated_at": "2026-02-17T12:30:00Z"
  }
}
```

**Response 403**
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You can only edit your own character"
  }
}
```

---

### DELETE /api/characters/:id
캐릭터 삭제 (soft delete, 본인만)

**인증**: 필수 (본인 확인)

**Response 200**
```json
{
  "message": "Character deleted successfully",
  "character": {
    "id": "c1d2e3f4g5h6",
    "deleted_at": "2026-02-17T12:45:00Z"
  }
}
```

**Response 403**
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You can only delete your own character"
  }
}
```

---

### GET /api/characters/me
내 캐릭터 조회

**인증**: 필수

**Response 200**
```json
{
  "character": {
    "id": "c1d2e3f4g5h6",
    "user_id": "a1b2c3d4e5f6",
    "name": "아리스",
    "title": "정의의 수호자",
    "faction": "lawbringer",
    "backstory": "도시의 법과 질서를 지키는 집행관...",
    "appearance": "은발의 여성, 청록색 눈동자...",
    "personality": "냉철하고 이성적이나, 약자에게는 따뜻함...",
    "status": "approved",
    "level": 5,
    "exp": 1250,
    "created_at": "2026-01-15T10:30:00Z",
    "updated_at": "2026-02-10T08:15:00Z"
  },
  "abilities": [
    {
      "id": "ab1cd2ef3gh4",
      "name": "심판의 일격",
      "category": "combat",
      "description": "정의의 힘을 담은 일격을 가한다",
      "cost_type": "stamina",
      "cost_value": 30
    },
    {
      "id": "ab2cd3ef4gh5",
      "name": "진실 간파",
      "category": "utility",
      "description": "상대의 거짓을 꿰뚫어본다",
      "cost_type": "focus",
      "cost_value": 20
    }
  ],
  "stats": {
    "battles_total": 16,
    "battles_won": 12,
    "battles_lost": 3,
    "battles_draw": 1,
    "win_rate": 0.75
  }
}
```

**Response 404**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "You don't have a character yet"
  }
}
```

---

## Abilities API

### POST /api/characters/:id/abilities
능력 추가 (캐릭터 생성 시 또는 레벨업 시)

**인증**: 필수 (본인 확인)

**Request Body**
```json
{
  "name": "빛의 방패",
  "category": "defense",
  "description": "정의의 빛으로 이루어진 방어막을 생성한다",
  "cost_type": "mana",
  "cost_value": 40
}
```

**Response 201**
```json
{
  "ability": {
    "id": "ab3cd4ef5gh6",
    "character_id": "c1d2e3f4g5h6",
    "name": "빛의 방패",
    "category": "defense",
    "description": "정의의 빛으로 이루어진 방어막을 생성한다",
    "cost_type": "mana",
    "cost_value": 40,
    "created_at": "2026-02-17T13:00:00Z"
  }
}
```

**Response 403**
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You can only add abilities to your own character"
  }
}
```

---

### GET /api/characters/:id/abilities
캐릭터의 능력 목록 조회

**인증**: 필수

**Response 200**
```json
{
  "abilities": [
    {
      "id": "ab1cd2ef3gh4",
      "character_id": "c1d2e3f4g5h6",
      "name": "심판의 일격",
      "category": "combat",
      "description": "정의의 힘을 담은 일격을 가한다",
      "cost_type": "stamina",
      "cost_value": 30,
      "created_at": "2026-01-15T10:30:00Z"
    },
    {
      "id": "ab2cd3ef4gh5",
      "character_id": "c1d2e3f4g5h6",
      "name": "진실 간파",
      "category": "utility",
      "description": "상대의 거짓을 꿰뚫어본다",
      "cost_type": "focus",
      "cost_value": 20,
      "created_at": "2026-01-15T10:30:00Z"
    },
    {
      "id": "ab3cd4ef5gh6",
      "character_id": "c1d2e3f4g5h6",
      "name": "빛의 방패",
      "category": "defense",
      "description": "정의의 빛으로 이루어진 방어막을 생성한다",
      "cost_type": "mana",
      "cost_value": 40,
      "created_at": "2026-02-17T13:00:00Z"
    }
  ]
}
```

---

### PATCH /api/abilities/:id
능력 수정

**인증**: 필수 (캐릭터 소유자만)

**Request Body**
```json
{
  "description": "수정된 능력 설명...",
  "cost_value": 35
}
```

**Response 200**
```json
{
  "ability": {
    "id": "ab1cd2ef3gh4",
    "character_id": "c1d2e3f4g5h6",
    "name": "심판의 일격",
    "category": "combat",
    "description": "수정된 능력 설명...",
    "cost_type": "stamina",
    "cost_value": 35,
    "updated_at": "2026-02-17T13:15:00Z"
  }
}
```

---

### DELETE /api/abilities/:id
능력 삭제 (soft delete)

**인증**: 필수 (캐릭터 소유자만)

**Response 200**
```json
{
  "message": "Ability deleted successfully",
  "ability": {
    "id": "ab1cd2ef3gh4",
    "deleted_at": "2026-02-17T13:20:00Z"
  }
}
```

---

## Battles API

### POST /api/battles
전투 게시물 생성 (대상 지목)

**인증**: 필수

**Request Body**
```json
{
  "opponent_character_id": "c2d3e4f5g6h7",
  "title": "정의의 심판",
  "description": "그림자 속에 숨어 악행을 일삼는 자여, 법의 이름으로 심판하겠다!",
  "bet_amount": 100,
  "turn_duration_hours": 24
}
```

**Response 201**
```json
{
  "battle": {
    "id": "bt1cd2ef3gh4",
    "initiator_character_id": "c1d2e3f4g5h6",
    "opponent_character_id": "c2d3e4f5g6h7",
    "title": "정의의 심판",
    "description": "그림자 속에 숨어 악행을 일삼는 자여, 법의 이름으로 심판하겠다!",
    "status": "open",
    "bet_amount": 100,
    "turn_duration_hours": 24,
    "current_turn": null,
    "turn_count": 0,
    "created_at": "2026-02-17T14:00:00Z"
  },
  "initiator": {
    "id": "c1d2e3f4g5h6",
    "name": "아리스",
    "faction": "lawbringer"
  },
  "opponent": {
    "id": "c2d3e4f5g6h7",
    "name": "제로",
    "faction": "rogue"
  }
}
```

---

### GET /api/battles
전투 목록 조회 (로비)

**인증**: 필수

**Request Query**
```
status?: string (open|in_progress|paused|completed|cancelled)
faction?: string (lawbringer|rogue|neutral)
page?: number (default: 1)
limit?: number (default: 20)
```

**Response 200**
```json
{
  "battles": [
    {
      "id": "bt1cd2ef3gh4",
      "title": "정의의 심판",
      "description": "그림자 속에 숨어 악행을 일삼는 자여...",
      "status": "open",
      "bet_amount": 100,
      "initiator": {
        "id": "c1d2e3f4g5h6",
        "name": "아리스",
        "faction": "lawbringer",
        "level": 5
      },
      "opponent": {
        "id": "c2d3e4f5g6h7",
        "name": "제로",
        "faction": "rogue",
        "level": 4
      },
      "created_at": "2026-02-17T14:00:00Z"
    },
    {
      "id": "bt2cd3ef4gh5",
      "title": "그림자의 복수",
      "description": "빛은 언젠가 꺼진다...",
      "status": "in_progress",
      "bet_amount": 150,
      "initiator": {
        "id": "c3d4e5f6g7h8",
        "name": "루나",
        "faction": "neutral",
        "level": 6
      },
      "opponent": {
        "id": "c4d5e6f7g8h9",
        "name": "블레이드",
        "faction": "rogue",
        "level": 5
      },
      "current_turn": "c3d4e5f6g7h8",
      "turn_deadline": "2026-02-18T14:00:00Z",
      "created_at": "2026-02-16T14:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 8,
    "total_pages": 1
  }
}
```

---

### GET /api/battles/:id
전투 상세 정보 조회

**인증**: 필수

**Response 200**
```json
{
  "battle": {
    "id": "bt1cd2ef3gh4",
    "initiator_character_id": "c1d2e3f4g5h6",
    "opponent_character_id": "c2d3e4f5g6h7",
    "title": "정의의 심판",
    "description": "그림자 속에 숨어 악행을 일삼는 자여, 법의 이름으로 심판하겠다!",
    "status": "in_progress",
    "bet_amount": 100,
    "turn_duration_hours": 24,
    "current_turn": "c1d2e3f4g5h6",
    "turn_count": 3,
    "turn_deadline": "2026-02-18T16:30:00Z",
    "created_at": "2026-02-17T14:00:00Z",
    "started_at": "2026-02-17T15:00:00Z"
  },
  "initiator": {
    "id": "c1d2e3f4g5h6",
    "name": "아리스",
    "faction": "lawbringer",
    "level": 5,
    "user": {
      "discord_username": "player#1234"
    }
  },
  "opponent": {
    "id": "c2d3e4f5g6h7",
    "name": "제로",
    "faction": "rogue",
    "level": 4,
    "user": {
      "discord_username": "shadow#5678"
    }
  },
  "turns": [
    {
      "id": "tn1cd2ef3gh4",
      "battle_id": "bt1cd2ef3gh4",
      "character_id": "c1d2e3f4g5h6",
      "turn_number": 1,
      "narrative": "아리스는 칼을 뽑아들며 날카로운 눈빛으로 제로를 노려보았다...",
      "abilities_used": ["ab1cd2ef3gh4"],
      "gm_judgment": {
        "result": "success",
        "damage": 35,
        "commentary": "정확한 일격이 상대의 방어를 뚫었습니다."
      },
      "agreed": true,
      "submitted_at": "2026-02-17T15:00:00Z",
      "judged_at": "2026-02-17T15:30:00Z"
    },
    {
      "id": "tn2cd3ef4gh5",
      "battle_id": "bt1cd2ef3gh4",
      "character_id": "c2d3e4f5g6h7",
      "turn_number": 2,
      "narrative": "제로는 그림자 속으로 몸을 숨기며 기회를 엿보았다...",
      "abilities_used": ["ab4cd5ef6gh7"],
      "gm_judgment": {
        "result": "partial",
        "damage": 20,
        "commentary": "은신에 성공했으나 완벽한 기습은 아니었습니다."
      },
      "agreed": true,
      "submitted_at": "2026-02-17T22:00:00Z",
      "judged_at": "2026-02-17T22:30:00Z"
    },
    {
      "id": "tn3cd4ef5gh6",
      "battle_id": "bt1cd2ef3gh4",
      "character_id": "c1d2e3f4g5h6",
      "turn_number": 3,
      "narrative": "아리스는 빛의 방패를 전개하며 상대의 공격을 대비했다...",
      "abilities_used": ["ab3cd4ef5gh6"],
      "gm_judgment": null,
      "agreed": false,
      "submitted_at": "2026-02-18T10:00:00Z"
    }
  ]
}
```

---

### POST /api/battles/:id/accept
전투 수락

**인증**: 필수 (상대방만)

**Response 200**
```json
{
  "battle": {
    "id": "bt1cd2ef3gh4",
    "status": "in_progress",
    "current_turn": "c1d2e3f4g5h6",
    "turn_deadline": "2026-02-18T15:00:00Z",
    "started_at": "2026-02-17T15:00:00Z"
  },
  "message": "Battle started"
}
```

**Response 403**
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Only the challenged player can accept"
  }
}
```

---

### POST /api/battles/:id/reject
전투 거절

**인증**: 필수 (상대방만)

**Request Body**
```json
{
  "reason": "현재 다른 전투 중"
}
```

**Response 200**
```json
{
  "battle": {
    "id": "bt1cd2ef3gh4",
    "status": "cancelled",
    "cancelled_at": "2026-02-17T15:30:00Z",
    "cancel_reason": "현재 다른 전투 중"
  },
  "message": "Battle rejected"
}
```

---

### POST /api/battles/:id/turns
서술 제출

**인증**: 필수 (현재 턴 플레이어만)

**Request Body**
```json
{
  "narrative": "아리스는 칼을 뽑아들며 날카로운 눈빛으로 제로를 노려보았다. '정의의 이름으로, 너의 죄를 심판하겠다!' 그녀의 칼날이 빛나기 시작했다.",
  "abilities_used": ["ab1cd2ef3gh4"]
}
```

**Response 201**
```json
{
  "turn": {
    "id": "tn1cd2ef3gh4",
    "battle_id": "bt1cd2ef3gh4",
    "character_id": "c1d2e3f4g5h6",
    "turn_number": 1,
    "narrative": "아리스는 칼을 뽑아들며 날카로운 눈빛으로 제로를 노려보았다...",
    "abilities_used": ["ab1cd2ef3gh4"],
    "gm_judgment": null,
    "agreed": false,
    "submitted_at": "2026-02-17T15:00:00Z",
    "edit_count": 0
  },
  "battle": {
    "id": "bt1cd2ef3gh4",
    "current_turn": "c2d3e4f5g6h7",
    "turn_deadline": "2026-02-18T15:00:00Z"
  }
}
```

---

### PATCH /api/battles/:id/turns/:turnId
서술 수정 (1회만 가능)

**인증**: 필수 (서술 작성자만)

**Request Body**
```json
{
  "narrative": "수정된 서술 내용..."
}
```

**Response 200**
```json
{
  "turn": {
    "id": "tn1cd2ef3gh4",
    "battle_id": "bt1cd2ef3gh4",
    "character_id": "c1d2e3f4g5h6",
    "turn_number": 1,
    "narrative": "수정된 서술 내용...",
    "abilities_used": ["ab1cd2ef3gh4"],
    "gm_judgment": null,
    "agreed": false,
    "submitted_at": "2026-02-17T15:00:00Z",
    "edited_at": "2026-02-17T15:10:00Z",
    "edit_count": 1
  }
}
```

**Response 403**
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You have already edited this turn"
  }
}
```

---

### POST /api/battles/:id/turns/:turnId/agree
판정 합의

**인증**: 필수 (상대 플레이어만)

**Response 200**
```json
{
  "turn": {
    "id": "tn1cd2ef3gh4",
    "agreed": true,
    "agreed_at": "2026-02-17T15:20:00Z"
  },
  "message": "Agreement recorded, triggering AI judgment"
}
```

---

### POST /api/battles/:id/judge
AI GM 판정 트리거 (양측 합의 후 자동 호출)

**인증**: 필수

**Response 200**
```json
{
  "judgment": {
    "turn_id": "tn1cd2ef3gh4",
    "result": "success",
    "damage": 35,
    "commentary": "정확한 일격이 상대의 방어를 뚫었습니다. 아리스의 심판의 일격은 제로의 그림자 방어막을 찢으며 깊은 상처를 남겼습니다.",
    "bias_applied": "neutral",
    "judged_at": "2026-02-17T15:30:00Z"
  },
  "battle_state": {
    "initiator_hp": 100,
    "opponent_hp": 65,
    "turn_count": 1
  }
}
```

---

### POST /api/battles/:id/pause
전투 중단 요청

**인증**: 필수 (참가자만)

**Request Body**
```json
{
  "reason": "긴급한 일정으로 인한 중단 요청"
}
```

**Response 200**
```json
{
  "battle": {
    "id": "bt1cd2ef3gh4",
    "pause_requested_by": "c1d2e3f4g5h6",
    "pause_reason": "긴급한 일정으로 인한 중단 요청",
    "pause_requested_at": "2026-02-17T16:00:00Z",
    "pause_expires_at": "2026-02-18T16:00:00Z"
  },
  "message": "Pause request sent, awaiting opponent response"
}
```

---

### POST /api/battles/:id/pause/accept
중단 수락

**인증**: 필수 (상대방만)

**Response 200**
```json
{
  "battle": {
    "id": "bt1cd2ef3gh4",
    "status": "paused",
    "paused_at": "2026-02-17T16:30:00Z",
    "pause_reason": "긴급한 일정으로 인한 중단 요청"
  },
  "message": "Battle paused"
}
```

---

### POST /api/battles/:id/resume
전투 재개

**인증**: 필수 (중단 요청자만)

**Response 200**
```json
{
  "battle": {
    "id": "bt1cd2ef3gh4",
    "status": "in_progress",
    "resumed_at": "2026-02-18T10:00:00Z",
    "current_turn": "c2d3e4f5g6h7",
    "turn_deadline": "2026-02-19T10:00:00Z"
  },
  "message": "Battle resumed"
}
```

---

### GET /api/battles/:id/ooc
OOC 채팅 조회

**인증**: 필수 (참가자만)

**Request Query**
```
limit?: number (default: 50)
before?: string (message ID for pagination)
```

**Response 200**
```json
{
  "messages": [
    {
      "id": "oc1cd2ef3gh4",
      "battle_id": "bt1cd2ef3gh4",
      "character_id": "c1d2e3f4g5h6",
      "message": "이번 턴은 방어 위주로 갈게요",
      "created_at": "2026-02-17T15:45:00Z",
      "character": {
        "name": "아리스",
        "user": {
          "discord_username": "player#1234"
        }
      }
    },
    {
      "id": "oc2cd3ef4gh5",
      "battle_id": "bt1cd2ef3gh4",
      "character_id": "c2d3e4f5g6h7",
      "message": "알겠습니다. 좋은 전투 되길!",
      "created_at": "2026-02-17T15:46:00Z",
      "character": {
        "name": "제로",
        "user": {
          "discord_username": "shadow#5678"
        }
      }
    }
  ]
}
```

---

### POST /api/battles/:id/ooc
OOC 메시지 전송

**인증**: 필수 (참가자만)

**Request Body**
```json
{
  "message": "이번 턴은 방어 위주로 갈게요"
}
```

**Response 201**
```json
{
  "message": {
    "id": "oc1cd2ef3gh4",
    "battle_id": "bt1cd2ef3gh4",
    "character_id": "c1d2e3f4g5h6",
    "message": "이번 턴은 방어 위주로 갈게요",
    "created_at": "2026-02-17T15:45:00Z"
  }
}
```

---

## Rooms API (일반 RP)

### POST /api/rooms
RP 방 생성

**인증**: 필수

**Request Body**
```json
{
  "name": "도시의 밤",
  "description": "네온사인이 빛나는 도심 한복판, 각자의 이야기가 교차하는 밤",
  "type": "public",
  "max_participants": 5
}
```

**Response 201**
```json
{
  "room": {
    "id": "rm1cd2ef3gh4",
    "owner_character_id": "c1d2e3f4g5h6",
    "name": "도시의 밤",
    "description": "네온사인이 빛나는 도심 한복판, 각자의 이야기가 교차하는 밤",
    "type": "public",
    "max_participants": 5,
    "participant_count": 1,
    "status": "active",
    "created_at": "2026-02-17T18:00:00Z"
  }
}
```

---

### GET /api/rooms
RP 방 목록 조회

**인증**: 필수

**Request Query**
```
type?: string (public|private)
status?: string (active|archived)
page?: number (default: 1)
limit?: number (default: 20)
```

**Response 200**
```json
{
  "rooms": [
    {
      "id": "rm1cd2ef3gh4",
      "name": "도시의 밤",
      "description": "네온사인이 빛나는 도심 한복판...",
      "type": "public",
      "max_participants": 5,
      "participant_count": 3,
      "status": "active",
      "owner": {
        "id": "c1d2e3f4g5h6",
        "name": "아리스",
        "faction": "lawbringer"
      },
      "last_message_at": "2026-02-17T20:30:00Z",
      "created_at": "2026-02-17T18:00:00Z"
    },
    {
      "id": "rm2cd3ef4gh5",
      "name": "그림자의 은신처",
      "description": "어둠이 지배하는 뒷골목...",
      "type": "private",
      "max_participants": 3,
      "participant_count": 2,
      "status": "active",
      "owner": {
        "id": "c2d3e4f5g6h7",
        "name": "제로",
        "faction": "rogue"
      },
      "last_message_at": "2026-02-17T19:15:00Z",
      "created_at": "2026-02-17T17:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 12,
    "total_pages": 1
  }
}
```

---

### GET /api/rooms/:id
RP 방 상세 정보 + 최근 메시지

**인증**: 필수 (참가자만)

**Request Query**
```
message_limit?: number (default: 50)
```

**Response 200**
```json
{
  "room": {
    "id": "rm1cd2ef3gh4",
    "owner_character_id": "c1d2e3f4g5h6",
    "name": "도시의 밤",
    "description": "네온사인이 빛나는 도심 한복판, 각자의 이야기가 교차하는 밤",
    "type": "public",
    "max_participants": 5,
    "participant_count": 3,
    "status": "active",
    "created_at": "2026-02-17T18:00:00Z"
  },
  "participants": [
    {
      "id": "c1d2e3f4g5h6",
      "name": "아리스",
      "faction": "lawbringer",
      "joined_at": "2026-02-17T18:00:00Z"
    },
    {
      "id": "c2d3e4f5g6h7",
      "name": "제로",
      "faction": "rogue",
      "joined_at": "2026-02-17T18:30:00Z"
    },
    {
      "id": "c3d4e5f6g7h8",
      "name": "루나",
      "faction": "neutral",
      "joined_at": "2026-02-17T19:00:00Z"
    }
  ],
  "messages": [
    {
      "id": "msg1cd2ef3g",
      "room_id": "rm1cd2ef3gh4",
      "character_id": "c1d2e3f4g5h6",
      "content": "밤공기가 차갑군. 오늘따라 거리가 조용하다.",
      "type": "narrative",
      "created_at": "2026-02-17T18:05:00Z",
      "character": {
        "name": "아리스",
        "faction": "lawbringer"
      }
    },
    {
      "id": "msg2cd3ef4g",
      "room_id": "rm1cd2ef3gh4",
      "character_id": "c2d3e4f5g6h7",
      "content": "조용한 게 오히려 수상하지 않나?",
      "type": "dialogue",
      "created_at": "2026-02-17T18:35:00Z",
      "character": {
        "name": "제로",
        "faction": "rogue"
      }
    }
  ]
}
```

---

### POST /api/rooms/:id/join
RP 방 참가

**인증**: 필수

**Response 200**
```json
{
  "participation": {
    "room_id": "rm1cd2ef3gh4",
    "character_id": "c2d3e4f5g6h7",
    "joined_at": "2026-02-17T18:30:00Z"
  },
  "room": {
    "participant_count": 2
  }
}
```

**Response 403**
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Room is full"
  }
}
```

---

### POST /api/rooms/:id/leave
RP 방 퇴장

**인증**: 필수 (참가자만)

**Response 200**
```json
{
  "message": "Left the room successfully",
  "room": {
    "id": "rm1cd2ef3gh4",
    "participant_count": 2
  }
}
```

---

### POST /api/rooms/:id/messages
메시지 전송

**인증**: 필수 (참가자만)

**Request Body**
```json
{
  "content": "밤공기가 차갑군. 오늘따라 거리가 조용하다.",
  "type": "narrative"
}
```

**Response 201**
```json
{
  "message": {
    "id": "msg1cd2ef3g",
    "room_id": "rm1cd2ef3gh4",
    "character_id": "c1d2e3f4g5h6",
    "content": "밤공기가 차갑군. 오늘따라 거리가 조용하다.",
    "type": "narrative",
    "created_at": "2026-02-17T18:05:00Z"
  }
}
```

---

### GET /api/rooms/:id/messages
메시지 조회 (페이지네이션)

**인증**: 필수 (참가자만)

**Request Query**
```
limit?: number (default: 50, max: 100)
before?: string (message ID)
after?: string (message ID)
```

**Response 200**
```json
{
  "messages": [
    {
      "id": "msg1cd2ef3g",
      "room_id": "rm1cd2ef3gh4",
      "character_id": "c1d2e3f4g5h6",
      "content": "밤공기가 차갑군. 오늘따라 거리가 조용하다.",
      "type": "narrative",
      "created_at": "2026-02-17T18:05:00Z",
      "character": {
        "name": "아리스",
        "faction": "lawbringer",
        "user": {
          "discord_username": "player#1234"
        }
      }
    },
    {
      "id": "msg2cd3ef4g",
      "room_id": "rm1cd2ef3gh4",
      "character_id": "c2d3e4f5g6h7",
      "content": "조용한 게 오히려 수상하지 않나?",
      "type": "dialogue",
      "created_at": "2026-02-17T18:35:00Z",
      "character": {
        "name": "제로",
        "faction": "rogue",
        "user": {
          "discord_username": "shadow#5678"
        }
      }
    }
  ],
  "has_more": true,
  "next_cursor": "msg2cd3ef4g"
}
```

---

### POST /api/rooms/:id/lore
서사 반영 요청 (범위 지정)

**인증**: 필수 (참가자만)

**Request Body**
```json
{
  "title": "도시의 밤 사건",
  "description": "아리스와 제로의 대화가 이후 큰 사건의 발단이 되었다",
  "message_ids": ["msg1cd2ef3g", "msg2cd3ef4g", "msg3cd4ef5g"],
  "scope": "global"
}
```

**Response 201**
```json
{
  "lore_request": {
    "id": "lr1cd2ef3gh4",
    "room_id": "rm1cd2ef3gh4",
    "requester_character_id": "c1d2e3f4g5h6",
    "title": "도시의 밤 사건",
    "description": "아리스와 제로의 대화가 이후 큰 사건의 발단이 되었다",
    "message_ids": ["msg1cd2ef3g", "msg2cd3ef4g", "msg3cd4ef5g"],
    "scope": "global",
    "status": "pending",
    "votes_required": 2,
    "votes_current": 0,
    "ai_analysis": {
      "relevance_score": 0.85,
      "impact_level": "major",
      "suggested_tags": ["investigation", "alliance", "mystery"]
    },
    "created_at": "2026-02-17T21:00:00Z"
  }
}
```

---

### POST /api/rooms/:id/lore/:requestId/vote
서사 반영 동의/거부

**인증**: 필수 (해당 메시지 관련 참가자만)

**Request Body**
```json
{
  "vote": "approve",
  "comment": "좋은 전개입니다"
}
```

**Response 200**
```json
{
  "vote": {
    "lore_request_id": "lr1cd2ef3gh4",
    "character_id": "c2d3e4f5g6h7",
    "vote": "approve",
    "comment": "좋은 전개입니다",
    "created_at": "2026-02-17T21:15:00Z"
  },
  "lore_request": {
    "id": "lr1cd2ef3gh4",
    "status": "approved",
    "votes_current": 2,
    "approved_at": "2026-02-17T21:15:00Z"
  }
}
```

---

### POST /api/rooms/:id/battle
RP 중 전투방 생성

**인증**: 필수 (참가자만)

**Request Body**
```json
{
  "opponent_character_id": "c2d3e4f5g6h7",
  "title": "밤의 대결",
  "description": "RP에서 시작된 갈등이 전투로 이어졌다",
  "bet_amount": 50,
  "context_message_ids": ["msg1cd2ef3g", "msg2cd3ef4g"]
}
```

**Response 201**
```json
{
  "battle": {
    "id": "bt3cd4ef5gh6",
    "initiator_character_id": "c1d2e3f4g5h6",
    "opponent_character_id": "c2d3e4f5g6h7",
    "title": "밤의 대결",
    "description": "RP에서 시작된 갈등이 전투로 이어졌다",
    "status": "open",
    "bet_amount": 50,
    "source_room_id": "rm1cd2ef3gh4",
    "context_message_ids": ["msg1cd2ef3g", "msg2cd3ef4g"],
    "created_at": "2026-02-17T21:30:00Z"
  }
}
```

---

## News API

### GET /api/news
뉴스 목록 조회 (published만)

**인증**: 필수

**Request Query**
```
category?: string (battle|event|lore|announcement)
page?: number (default: 1)
limit?: number (default: 20)
```

**Response 200**
```json
{
  "news": [
    {
      "id": "nw1cd2ef3gh4",
      "title": "정의와 그림자의 격돌",
      "summary": "법집행관 아리스와 로그 제로의 전투가 도심에서 벌어졌다...",
      "category": "battle",
      "image_url": "https://storage.supabase.co/...",
      "status": "published",
      "view_count": 142,
      "reaction_count": 23,
      "published_at": "2026-02-17T18:00:00Z",
      "created_at": "2026-02-17T17:30:00Z"
    },
    {
      "id": "nw2cd3ef4gh5",
      "title": "도시에 새로운 세력 등장",
      "summary": "중립 진영의 루나가 조용히 세력을 키우고 있다...",
      "category": "event",
      "image_url": "https://storage.supabase.co/...",
      "status": "published",
      "view_count": 89,
      "reaction_count": 15,
      "published_at": "2026-02-17T12:00:00Z",
      "created_at": "2026-02-17T11:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "total_pages": 3
  }
}
```

---

### GET /api/news/:id
뉴스 상세 조회

**인증**: 필수

**Response 200**
```json
{
  "news": {
    "id": "nw1cd2ef3gh4",
    "title": "정의와 그림자의 격돌",
    "summary": "법집행관 아리스와 로그 제로의 전투가 도심에서 벌어졌다...",
    "content": "## 전투 개요\n\n법집행관 아리스와 로그 제로의 오랜 대립이 드디어...\n\n### 전투 하이라이트\n\n- 아리스의 심판의 일격이 제로의 그림자 방어를 뚫었다\n- 제로는 은신술로 대응했으나...\n\n## 결과\n\n아리스의 승리로 종료되었으며...",
    "category": "battle",
    "image_url": "https://storage.supabase.co/...",
    "status": "published",
    "source_battle_id": "bt1cd2ef3gh4",
    "source_lore_id": null,
    "view_count": 142,
    "reaction_count": 23,
    "published_at": "2026-02-17T18:00:00Z",
    "created_at": "2026-02-17T17:30:00Z",
    "updated_at": "2026-02-17T18:00:00Z"
  },
  "related_characters": [
    {
      "id": "c1d2e3f4g5h6",
      "name": "아리스",
      "faction": "lawbringer"
    },
    {
      "id": "c2d3e4f5g6h7",
      "name": "제로",
      "faction": "rogue"
    }
  ],
  "reactions": [
    {
      "emoji": "🔥",
      "count": 12
    },
    {
      "emoji": "⚔️",
      "count": 8
    },
    {
      "emoji": "👏",
      "count": 3
    }
  ]
}
```

---

### POST /api/news/:id/react
리액션 토글 (추가/제거)

**인증**: 필수

**Request Body**
```json
{
  "emoji": "🔥"
}
```

**Response 200**
```json
{
  "reaction": {
    "news_id": "nw1cd2ef3gh4",
    "user_id": "a1b2c3d4e5f6",
    "emoji": "🔥",
    "created_at": "2026-02-17T19:00:00Z"
  },
  "action": "added"
}
```

**Response 200 (제거 시)**
```json
{
  "action": "removed"
}
```

---

### GET /api/news/:id/reactions
리액션 목록 조회

**인증**: 필수

**Response 200**
```json
{
  "reactions": [
    {
      "emoji": "🔥",
      "users": [
        {
          "id": "a1b2c3d4e5f6",
          "discord_username": "player#1234"
        },
        {
          "id": "b2c3d4e5f6g7",
          "discord_username": "shadow#5678"
        }
      ],
      "count": 12
    },
    {
      "emoji": "⚔️",
      "users": [
        {
          "id": "c3d4e5f6g7h8",
          "discord_username": "luna#9012"
        }
      ],
      "count": 8
    }
  ]
}
```

---

## Notifications API

### GET /api/notifications
내 알림 목록 조회

**인증**: 필수

**Request Query**
```
unread_only?: boolean (default: false)
limit?: number (default: 50)
```

**Response 200**
```json
{
  "notifications": [
    {
      "id": "nt1cd2ef3gh4",
      "user_id": "a1b2c3d4e5f6",
      "type": "battle_challenge",
      "title": "제로의 전투 신청",
      "message": "제로가 당신에게 전투를 신청했습니다",
      "link": "/battle/bt1cd2ef3gh4",
      "data": {
        "battle_id": "bt1cd2ef3gh4",
        "opponent_name": "제로"
      },
      "is_read": false,
      "created_at": "2026-02-17T14:00:00Z"
    },
    {
      "id": "nt2cd3ef4gh5",
      "user_id": "a1b2c3d4e5f6",
      "type": "your_turn",
      "title": "전투에서 당신의 차례",
      "message": "제로와의 전투에서 당신의 턴입니다 (마감: 24시간)",
      "link": "/battle/bt1cd2ef3gh4",
      "data": {
        "battle_id": "bt1cd2ef3gh4",
        "turn_deadline": "2026-02-18T15:00:00Z"
      },
      "is_read": false,
      "created_at": "2026-02-17T15:00:00Z"
    },
    {
      "id": "nt3cd4ef5gh6",
      "user_id": "a1b2c3d4e5f6",
      "type": "character_approved",
      "title": "캐릭터 아리스 승인 완료",
      "message": "축하합니다! 캐릭터가 승인되었습니다",
      "link": "/character/c1d2e3f4g5h6",
      "data": {
        "character_id": "c1d2e3f4g5h6",
        "character_name": "아리스"
      },
      "is_read": true,
      "read_at": "2026-01-15T11:00:00Z",
      "created_at": "2026-01-15T10:35:00Z"
    }
  ],
  "unread_count": 2
}
```

---

### PATCH /api/notifications/:id/read
알림 읽음 처리

**인증**: 필수 (본인만)

**Response 200**
```json
{
  "notification": {
    "id": "nt1cd2ef3gh4",
    "is_read": true,
    "read_at": "2026-02-17T20:00:00Z"
  }
}
```

---

### PATCH /api/notifications/read-all
전체 알림 읽음 처리

**인증**: 필수

**Response 200**
```json
{
  "message": "All notifications marked as read",
  "count": 5
}
```

---

## Character Lore API

### GET /api/characters/:id/lore
캐릭터 서사 타임라인 조회

**인증**: 필수

**Response 200**
```json
{
  "character": {
    "id": "c1d2e3f4g5h6",
    "name": "아리스",
    "faction": "lawbringer"
  },
  "lore_entries": [
    {
      "id": "le1cd2ef3gh4",
      "character_id": "c1d2e3f4g5h6",
      "type": "battle_result",
      "title": "제로와의 대결에서 승리",
      "description": "그림자 속의 칼날 제로와의 격렬한 전투 끝에 승리를 거두었다",
      "source_battle_id": "bt1cd2ef3gh4",
      "source_lore_request_id": null,
      "impact_level": "major",
      "tags": ["victory", "justice", "shadow"],
      "occurred_at": "2026-02-17T18:00:00Z",
      "created_at": "2026-02-17T18:30:00Z"
    },
    {
      "id": "le2cd3ef4gh5",
      "character_id": "c1d2e3f4g5h6",
      "type": "lore_event",
      "title": "도시의 밤 사건",
      "description": "제로와의 대화가 이후 큰 사건의 발단이 되었다",
      "source_battle_id": null,
      "source_lore_request_id": "lr1cd2ef3gh4",
      "impact_level": "moderate",
      "tags": ["investigation", "alliance", "mystery"],
      "occurred_at": "2026-02-17T21:00:00Z",
      "created_at": "2026-02-17T21:20:00Z"
    },
    {
      "id": "le3cd4ef5gh6",
      "character_id": "c1d2e3f4g5h6",
      "type": "character_creation",
      "title": "법집행관 아리스의 등장",
      "description": "도시의 법과 질서를 지키는 새로운 집행관이 나타났다",
      "source_battle_id": null,
      "source_lore_request_id": null,
      "impact_level": "major",
      "tags": ["debut", "lawbringer"],
      "occurred_at": "2026-01-15T10:30:00Z",
      "created_at": "2026-01-15T10:35:00Z"
    }
  ],
  "timeline_stats": {
    "total_entries": 3,
    "battles_won": 1,
    "lore_events": 1,
    "impact_score": 85
  }
}
```

---

## Admin API

### GET /api/admin/characters/pending
승인 대기 중인 캐릭터 목록

**인증**: 필수 (관리자만)

**Response 200**
```json
{
  "characters": [
    {
      "id": "c5d6e7f8g9h0",
      "user_id": "d5e6f7g8h9i0",
      "name": "샤도우",
      "title": "어둠의 사도",
      "faction": "rogue",
      "backstory": "어둠 속에서 자란 암살자...",
      "appearance": "검은 마스크를 쓴 남성...",
      "personality": "냉철하고 무자비하다...",
      "status": "pending",
      "user": {
        "discord_username": "assassin#3456",
        "avatar_url": "https://cdn.discordapp.com/avatars/..."
      },
      "abilities": [
        {
          "name": "암살",
          "category": "combat",
          "description": "은밀하게 적을 제거한다"
        },
        {
          "name": "은신",
          "category": "utility",
          "description": "완벽하게 기척을 숨긴다"
        }
      ],
      "created_at": "2026-02-17T10:00:00Z"
    }
  ]
}
```

---

### POST /api/admin/characters/:id/approve
캐릭터 승인

**인증**: 필수 (관리자만)

**Request Body**
```json
{
  "comment": "흥미로운 설정입니다. 승인합니다."
}
```

**Response 200**
```json
{
  "character": {
    "id": "c5d6e7f8g9h0",
    "status": "approved",
    "approved_at": "2026-02-17T21:00:00Z",
    "approved_by": "admin_user_id",
    "admin_comment": "흥미로운 설정입니다. 승인합니다."
  }
}
```

---

### POST /api/admin/characters/:id/reject
캐릭터 반려

**인증**: 필수 (관리자만)

**Request Body**
```json
{
  "reason": "능력 설명이 너무 추상적입니다. 구체적인 효과와 제한사항을 명시해주세요."
}
```

**Response 200**
```json
{
  "character": {
    "id": "c5d6e7f8g9h0",
    "status": "rejected",
    "rejected_at": "2026-02-17T21:00:00Z",
    "rejected_by": "admin_user_id",
    "rejection_reason": "능력 설명이 너무 추상적입니다. 구체적인 효과와 제한사항을 명시해주세요."
  }
}
```

---

### GET /api/admin/news
뉴스 관리 (전체, draft 포함)

**인증**: 필수 (관리자만)

**Request Query**
```
status?: string (draft|published|archived)
category?: string (battle|event|lore|announcement)
page?: number (default: 1)
limit?: number (default: 20)
```

**Response 200**
```json
{
  "news": [
    {
      "id": "nw3cd4ef5gh6",
      "title": "새로운 시즌 시작",
      "summary": "시즌 2가 곧 시작됩니다...",
      "content": "## 시즌 2 주요 변경사항\n\n...",
      "category": "announcement",
      "status": "draft",
      "created_by": "admin_user_id",
      "created_at": "2026-02-17T20:00:00Z",
      "updated_at": "2026-02-17T20:30:00Z"
    },
    {
      "id": "nw1cd2ef3gh4",
      "title": "정의와 그림자의 격돌",
      "summary": "법집행관 아리스와 로그 제로의 전투가 도심에서 벌어졌다...",
      "category": "battle",
      "status": "published",
      "source_battle_id": "bt1cd2ef3gh4",
      "view_count": 142,
      "reaction_count": 23,
      "published_at": "2026-02-17T18:00:00Z",
      "created_at": "2026-02-17T17:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 52,
    "total_pages": 3
  }
}
```

---

### POST /api/admin/news
뉴스 수동 생성

**인증**: 필수 (관리자만)

**Request Body**
```json
{
  "title": "새로운 시즌 시작",
  "summary": "시즌 2가 곧 시작됩니다. 새로운 진영과 능력이 추가됩니다.",
  "content": "## 시즌 2 주요 변경사항\n\n### 새로운 진영\n\n- **테크노크라트**: 기술과 과학의 힘을 다루는 진영\n\n### 새로운 능력 시스템\n\n...",
  "category": "announcement",
  "image_url": "https://storage.supabase.co/...",
  "auto_publish": false
}
```

**Response 201**
```json
{
  "news": {
    "id": "nw3cd4ef5gh6",
    "title": "새로운 시즌 시작",
    "summary": "시즌 2가 곧 시작됩니다. 새로운 진영과 능력이 추가됩니다.",
    "content": "## 시즌 2 주요 변경사항\n\n...",
    "category": "announcement",
    "image_url": "https://storage.supabase.co/...",
    "status": "draft",
    "created_by": "admin_user_id",
    "created_at": "2026-02-17T20:00:00Z"
  }
}
```

---

### PATCH /api/admin/news/:id
뉴스 수정

**인증**: 필수 (관리자만)

**Request Body**
```json
{
  "title": "새로운 시즌 2 시작",
  "content": "수정된 본문..."
}
```

**Response 200**
```json
{
  "news": {
    "id": "nw3cd4ef5gh6",
    "title": "새로운 시즌 2 시작",
    "content": "수정된 본문...",
    "updated_at": "2026-02-17T20:45:00Z"
  }
}
```

---

### DELETE /api/admin/news/:id
뉴스 삭제 (soft delete)

**인증**: 필수 (관리자만)

**Response 200**
```json
{
  "message": "News deleted successfully",
  "news": {
    "id": "nw3cd4ef5gh6",
    "deleted_at": "2026-02-17T21:00:00Z"
  }
}
```

---

### POST /api/admin/news/:id/publish
뉴스 발행

**인증**: 필수 (관리자만)

**Response 200**
```json
{
  "news": {
    "id": "nw3cd4ef5gh6",
    "status": "published",
    "published_at": "2026-02-17T21:00:00Z"
  },
  "notification": {
    "message": "Discord notification sent to all users"
  }
}
```

---

### GET /api/admin/settings
시스템 설정 조회

**인증**: 필수 (관리자만)

**Response 200**
```json
{
  "settings": {
    "gm_bias": {
      "lawbringer": 0,
      "rogue": 0,
      "neutral": 0
    },
    "battle_settings": {
      "default_turn_duration_hours": 24,
      "max_turn_duration_hours": 72,
      "turn_edit_allowed": true,
      "turn_edit_count_limit": 1
    },
    "character_settings": {
      "max_abilities": 5,
      "min_abilities": 2,
      "approval_required": true
    },
    "lore_settings": {
      "approval_threshold": 0.7,
      "min_votes_required": 2
    },
    "season": {
      "current_season": 1,
      "season_start": "2026-01-01T00:00:00Z",
      "season_end": "2026-06-30T23:59:59Z"
    }
  }
}
```

---

### PATCH /api/admin/settings
시스템 설정 수정

**인증**: 필수 (관리자만)

**Request Body**
```json
{
  "gm_bias": {
    "lawbringer": 5,
    "rogue": -3,
    "neutral": 0
  },
  "battle_settings": {
    "default_turn_duration_hours": 48
  }
}
```

---

### GET /api/admin/settings/ai-model-routing
기능별 고정 AI 모델 라우팅 조회

**인증**: 필수 (관리자만)

**Response 200**
```json
{
  "routing": {
    "version": 1,
    "routes": {
      "main_story": { "primary": "claude-opus", "fallback": ["claude-sonnet"] },
      "battle_judgment": { "primary": "gemini-pro", "fallback": ["gemini-flash"] },
      "lore_reflection": { "primary": "gemini-flash", "fallback": ["claude-sonnet"] },
      "news_generation": { "primary": "gemini-flash", "fallback": [] }
    }
  },
  "allowed_models": ["claude-opus", "claude-sonnet", "gemini-pro", "gemini-flash"],
  "updated_at": "2026-02-17T21:30:00Z"
}
```

---

### PUT /api/admin/settings/ai-model-routing
기능별 고정 AI 모델 라우팅 전체 교체

**인증**: 필수 (관리자만)

**Request Body**
```json
{
  "version": 1,
  "routes": {
    "main_story": { "primary": "claude-opus", "fallback": ["claude-sonnet"] },
    "battle_judgment": { "primary": "gemini-pro", "fallback": ["gemini-flash"] },
    "lore_reflection": { "primary": "gemini-flash", "fallback": ["claude-sonnet"] },
    "news_generation": { "primary": "gemini-flash", "fallback": [] }
  },
  "reason": "시즌 후반 전투 판정 톤 유지"
}
```

**검증 규칙**
- 기능 키는 `main_story`, `battle_judgment`, `lore_reflection`, `news_generation`만 허용
- 모델은 allowlist 내 값만 허용
- `fallback`에 `primary` 중복 금지
- `version` 불일치 시 409 반환

**Response 200**
```json
{
  "settings": {
    "gm_bias": {
      "lawbringer": 5,
      "rogue": -3,
      "neutral": 0
    },
    "battle_settings": {
      "default_turn_duration_hours": 48,
      "max_turn_duration_hours": 72,
      "turn_edit_allowed": true,
      "turn_edit_count_limit": 1
    },
    "updated_at": "2026-02-17T21:30:00Z"
  }
}
```

---

### GET /api/admin/stats
시즌 대시보드 통계

**인증**: 필수 (관리자만)

**Request Query**
```
season?: number (default: current)
```

**Response 200**
```json
{
  "season": {
    "number": 1,
    "start": "2026-01-01T00:00:00Z",
    "end": "2026-06-30T23:59:59Z",
    "days_remaining": 134
  },
  "users": {
    "total": 247,
    "active_this_week": 89,
    "new_this_week": 12
  },
  "characters": {
    "total": 198,
    "approved": 175,
    "pending": 8,
    "rejected": 15,
    "by_faction": {
      "lawbringer": 72,
      "rogue": 65,
      "neutral": 38
    }
  },
  "battles": {
    "total": 342,
    "completed": 298,
    "in_progress": 23,
    "open": 12,
    "cancelled": 9,
    "avg_duration_hours": 36.5,
    "by_result": {
      "lawbringer_wins": 142,
      "rogue_wins": 98,
      "neutral_wins": 36,
      "draws": 22
    }
  },
  "rooms": {
    "total": 89,
    "active": 34,
    "archived": 55,
    "total_messages": 15432
  },
  "lore": {
    "total_requests": 67,
    "approved": 52,
    "pending": 8,
    "rejected": 7,
    "total_entries": 523
  },
  "news": {
    "total": 52,
    "published": 48,
    "draft": 4,
    "avg_views": 156,
    "total_reactions": 892
  }
}
```

---

## Batch Server / Edge Functions

### Cron Jobs

#### 뉴스 자동 생성
**스케줄**: 매일 3~4회 (00:00, 08:00, 16:00, 20:00 KST)  
**Function**: `auto-generate-news`

**처리 흐름**:
1. Supabase에서 최근 24시간 내 완료된 전투, 승인된 서사 반영 조회
2. Gemini Flash API 호출:
   ```
   Prompt: "다음 전투/이벤트를 바탕으로 도시 뉴스 기사를 작성해주세요..."
   ```
3. 생성된 뉴스를 `news` 테이블에 `draft` 상태로 저장
4. (옵션) `auto_publish` 설정 시 즉시 `published`로 변경 + Discord 알림

**AI Prompt 예시**:
```
당신은 도시의 뉴스 에디터입니다. 다음 정보를 바탕으로 흥미진진한 뉴스 기사를 작성해주세요:

전투 정보:
- 승자: 아리스 (Lawbringer, Lv.5)
- 패자: 제로 (Rogue, Lv.4)
- 전투 내용: [서술 요약]

요구사항:
- 제목: 30자 이내
- 요약: 100자 이내
- 본문: 마크다운 형식, 300-500자
- 양측의 관점을 균형있게 반영
- 도시 배경과 진영 갈등을 자연스럽게 포함
```

---

#### 타임아웃 체크
**스케줄**: 1분마다  
**Function**: `check-turn-timeout`

**처리 흐름**:
1. `battles` 테이블에서 `status = 'in_progress'` AND `turn_deadline < NOW()` 조회
2. 해당 전투의 `current_turn` 플레이어에게 자동 패스 처리:
   - 빈 서술 생성 (또는 기본 방어 행동)
   - `turn_count` 증가
   - `current_turn` 상대로 변경
   - `turn_deadline` 갱신
3. Discord 알림: "타임아웃으로 자동 패스 처리되었습니다"

---

#### 중단 자동 처리
**스케줄**: 1시간마다  
**Function**: `auto-handle-pause`

**처리 흐름**:
1. `battles` 테이블에서 `pause_requested_at < NOW() - 24 hours` AND `status != 'paused'` 조회
2. 해당 전투를 `cancelled` 상태로 변경
3. `cancel_reason` = "중단 요청 무응답"
4. Discord 알림: "24시간 미응답으로 전투가 자동 중단되었습니다"

---

### Event Triggers (Supabase DB Webhook)

#### 캐릭터 상태 변경
**Trigger**: `characters.status` UPDATE

```sql
CREATE TRIGGER on_character_status_change
AFTER UPDATE OF status ON characters
FOR EACH ROW
WHEN (OLD.status != NEW.status AND NEW.status IN ('approved', 'rejected'))
EXECUTE FUNCTION notify_discord_character_status();
```

**Discord 알림**:
```json
{
  "embeds": [{
    "title": "캐릭터 아리스 승인 완료",
    "description": "축하합니다! 캐릭터가 승인되었습니다.",
    "color": 5763719,
    "fields": [
      {
        "name": "캐릭터",
        "value": "아리스 (정의의 수호자)",
        "inline": true
      },
      {
        "name": "진영",
        "value": "Lawbringer",
        "inline": true
      }
    ],
    "timestamp": "2026-02-17T21:00:00Z"
  }],
  "components": [{
    "type": 1,
    "components": [{
      "type": 2,
      "style": 5,
      "label": "캐릭터 보기",
      "url": "https://solaris.example.com/character/c1d2e3f4g5h6"
    }]
  }]
}
```

---

#### 전투 신청
**Trigger**: `battles` INSERT (status='open')

**Discord 알림**:
```json
{
  "embeds": [{
    "title": "⚔️ 제로의 전투 신청",
    "description": "그림자 속에 숨어 악행을 일삼는 자여, 법의 이름으로 심판하겠다!",
    "color": 15158332,
    "fields": [
      {
        "name": "신청자",
        "value": "제로 (Lv.4, Rogue)",
        "inline": true
      },
      {
        "name": "베팅",
        "value": "100 포인트",
        "inline": true
      }
    ],
    "timestamp": "2026-02-17T14:00:00Z"
  }],
  "components": [{
    "type": 1,
    "components": [{
      "type": 2,
      "style": 5,
      "label": "수락/거절하기",
      "url": "https://solaris.example.com/battle/bt1cd2ef3gh4"
    }]
  }]
}
```

---

#### 내 턴 알림
**Trigger**: `battles.current_turn` UPDATE

**Discord 알림**:
```json
{
  "embeds": [{
    "title": "🎯 전투에서 당신의 차례",
    "description": "제로와의 전투에서 당신의 턴입니다",
    "color": 3447003,
    "fields": [
      {
        "name": "마감",
        "value": "<t:1706187600:R>",
        "inline": true
      },
      {
        "name": "전투",
        "value": "정의의 심판",
        "inline": true
      }
    ],
    "timestamp": "2026-02-17T15:00:00Z"
  }],
  "components": [{
    "type": 1,
    "components": [{
      "type": 2,
      "style": 5,
      "label": "서술 작성하기",
      "url": "https://solaris.example.com/battle/bt1cd2ef3gh4"
    }]
  }]
}
```

---

#### 전투 결과
**Trigger**: `battles.status` = 'completed'

**Discord 알림** + **뉴스 생성 트리거**:
```json
{
  "embeds": [{
    "title": "🏆 전투 종료: 아리스의 승리",
    "description": "법집행관 아리스가 로그 제로를 제압했습니다",
    "color": 5763719,
    "fields": [
      {
        "name": "결과",
        "value": "승리 (15턴)",
        "inline": true
      },
      {
        "name": "획득",
        "value": "+100 포인트, +50 EXP",
        "inline": true
      }
    ],
    "timestamp": "2026-02-17T18:00:00Z"
  }],
  "components": [{
    "type": 1,
    "components": [{
      "type": 2,
      "style": 5,
      "label": "전투 보기",
      "url": "https://solaris.example.com/battle/bt1cd2ef3gh4"
    }]
  }]
}
```

**뉴스 생성**: 즉시 `auto-generate-news` Edge Function 호출

---

#### 서사 반영 동의 요청
**Trigger**: `lore_requests` INSERT

**Discord 알림**:
```json
{
  "embeds": [{
    "title": "📖 서사 반영 동의 필요",
    "description": "아리스가 '도시의 밤 사건' 서사 반영을 요청했습니다",
    "color": 10181046,
    "fields": [
      {
        "name": "범위",
        "value": "Global (모든 캐릭터에 영향)",
        "inline": true
      },
      {
        "name": "AI 평가",
        "value": "관련도 85%, Major 영향",
        "inline": true
      }
    ],
    "timestamp": "2026-02-17T21:00:00Z"
  }],
  "components": [{
    "type": 1,
    "components": [{
      "type": 2,
      "style": 5,
      "label": "검토하기",
      "url": "https://solaris.example.com/room/rm1cd2ef3gh4"
    }]
  }]
}
```

---

#### RP 방 초대
**Trigger**: `room_participants` INSERT

**Discord 알림**:
```json
{
  "embeds": [{
    "title": "🎭 도시의 밤 방에 초대되었습니다",
    "description": "아리스가 당신을 RP 방에 초대했습니다",
    "color": 9807270,
    "timestamp": "2026-02-17T18:30:00Z"
  }],
  "components": [{
    "type": 1,
    "components": [{
      "type": 2,
      "style": 5,
      "label": "방 입장하기",
      "url": "https://solaris.example.com/room/rm1cd2ef3gh4"
    }]
  }]
}
```

---

#### 뉴스 발행
**Trigger**: `news.status` = 'published'

**Discord 알림** (전체 채널):
```json
{
  "embeds": [{
    "title": "📰 정의와 그림자의 격돌",
    "description": "법집행관 아리스와 로그 제로의 전투가 도심에서 벌어졌다...",
    "image": {
      "url": "https://storage.supabase.co/..."
    },
    "color": 15844367,
    "timestamp": "2026-02-17T18:00:00Z"
  }],
  "components": [{
    "type": 1,
    "components": [{
      "type": 2,
      "style": 5,
      "label": "전체 기사 보기",
      "url": "https://solaris.example.com/news/nw1cd2ef3gh4"
    }]
  }]
}
```

---

## 기타 규칙

### Rate Limiting
- 일반 엔드포인트: 60 requests/min per user
- 전투 서술 제출: 10 requests/min per user
- 메시지 전송: 30 requests/min per user
- Admin API: 120 requests/min per admin

### Pagination
기본값: `page=1`, `limit=20`  
최대값: `limit=100`

### Soft Delete
모든 삭제는 `deleted_at` 필드 업데이트로 처리.  
API 응답에서 `deleted_at IS NULL`인 리소스만 반환.

### Realtime Subscriptions (Supabase Realtime)
클라이언트는 다음 테이블을 구독 가능:
- `battles` (전투 상태 변경)
- `battle_turns` (새 서술 추가)
- `room_messages` (RP 메시지)
- `notifications` (실시간 알림)

---

## 개발 가이드

### 환경변수
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
DISCORD_CLIENT_ID=123456789012345678
DISCORD_CLIENT_SECRET=xxx
DISCORD_BOT_TOKEN=xxx
GEMINI_API_KEY=AIzaSy...
```

### 로컬 개발
```bash
npm install
npm run dev
```

### Supabase Edge Functions 배포
```bash
supabase functions deploy auto-generate-news
supabase functions deploy check-turn-timeout
supabase functions deploy auto-handle-pause
```

### Discord Bot 실행
```bash
node discord-bot/index.js
```

---

**문서 버전**: 1.0.0  
**최종 수정**: 2026-02-17
