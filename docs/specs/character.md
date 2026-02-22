# Character — 캐릭터 생성/프로필/도감/관계도

> 캐릭터 생성 위자드, 프로필, 도감(Registry), 관계도, 서사 타임라인.

---

## 화면 (프론트엔드)

### 캐릭터 생성 위자드 (`/character/create`)

스텝 바이 스텝. 한 화면에 한 선택. 명시적 "다음" 버튼 (스와이프 금지).
계정당 캐릭터 1개.

**Step 1: 팩션 선택**
- 보안국 / 스태틱 / 비능력자 카드 3장
- 각 카드: 팩션명 + 한줄 설명 + 스탯 미리보기 (HP/WILL)
- 보안국: HP 80 / WILL 250
- 스태틱: HP 120 / WILL 150
- 비능력자: HP 100 / WILL 100

**Step 2: 능력 계열 선택** (비능력자면 스킵)
- 역장(Field) / 감응(Empathy) / 변환(Shift) / 연산(Compute) 카드 4장

**Step 3: 능력 설계**
- 능력명 입력
- 기본기 / 중급기 / 상급기 (아코디언 UI)
  - 각각: 이름, 설명, 약점/대가
- 비능력자: 5개 메리트 자동 부여, 이 스텝 스킵 또는 장비/전술 설명 입력

**Step 4: 캐릭터 프로필**
- 이름, 나이, 외형 설명
- 배경 서사 (텍스트에어리어)
- 프로필 이미지 업로드

**Step 5: 최종 확인**
- 전체 시트 미리보기
- "제출" → 관리자 승인 대기 상태 진입
- 승인/반려 결과는 Discord DM으로 알림

---

### 캐릭터 프로필 (`/character/[id]`)

내 캐릭터 + 타인 캐릭터 공용. 타인 캐릭터는 **도감에서 클릭 시 모달**로 표시.

- 상단: 프로필 이미지 + 이름 + 팩션 뱃지
- HP/WILL 게이지 (가로 바, 현재값/최대값 **공개**)
- 능력 카드 3장 (기본기/중급기/상급기, 아코디언 접힘/펼침)
- 비능력자: 메리트 5개 카드로 표시
- 서사 기록 타임라인 (AI가 정리한 공식 이력)
- 전투 이력 리스트 (승/패/중단, 탭하면 아카이브로)

---

### 캐릭터 도감 (`/characters`)

전체 캐릭터 브라우징.

- **필터:** 소속 기준 (보안국 / 스태틱 / 비능력자)
- 카드 그리드: 썸네일 + 이름 + 팩션 뱃지 + 능력 계열 태그
- **카드 클릭 → 모달로 캐릭터 프로필 표시** (페이지 이동 없음)
- 검색: 이름 검색

---

### 캐릭터 관계도 (`/character/[id]` 내부)

캐릭터 프로필 모달/페이지 안에 "관계" 섹션 추가.

- **수동 입력:** "캐릭터 추가" → 도감에서 선택 → 관계 태그 입력 (자유 텍스트: "동맹", "경계 중", "원수", "연인" 등)
- **표시:** 관계 대상 캐릭터 썸네일 + 이름 + 관계 태그
- **상호성:** A가 B를 "동맹"으로 등록하면 B의 프로필에도 "A → 동맹" 표시 (단, B가 수정/삭제 가능)
- **Phase 2 확장:** AI가 RP 서사 반영 시 관계 태그를 자동 제안. 수동 수정 가능.

---

## API (백엔드)

### POST /api/characters
새 캐릭터 생성 (위자드 완료 시)

**인증**: 필수

**Request Body**
```json
{
  "name": "아리스",
  "faction": "bureau",
  "ability_class": "field",
  "backstory": "도시의 법과 질서를 지키는 집행관...",
  "appearance": "은발의 여성, 청록색 눈동자...",
  "abilities": [
    {
      "tier": "basic",
      "name": "심판의 일격",
      "description": "정의의 힘을 담은 일격을 가한다",
      "weakness": "에너지 집중 필요, 연속 사용 불가",
      "cost_hp": 0,
      "cost_will": 5
    }
  ]
}
```

**Response 201**: 생성된 캐릭터 + 능력 정보
**Response 409**: "User already has an active character"

---

### GET /api/characters
캐릭터 목록 조회 (도감/Registry)

**Query**: `faction?`, `status?`, `page?`, `limit?`

---

### GET /api/characters/:id
캐릭터 상세 정보 + 능력 + 전투 이력

---

### GET /api/characters/me
내 캐릭터 조회

---

### PATCH /api/characters/:id
캐릭터 정보 수정 (본인만). 능력 수정 시 재승인 필요.

---

### DELETE /api/characters/:id
캐릭터 삭제 (soft delete, 본인만)

---

### POST /api/characters/:id/abilities
능력 추가

### GET /api/characters/:id/abilities
능력 목록 조회

### PATCH /api/abilities/:id
능력 수정

### DELETE /api/abilities/:id
능력 삭제 (soft delete)

---

### GET /api/characters/:id/lore
캐릭터 서사 타임라인 조회

**Response 200**
```json
{
  "lore_entries": [
    {
      "id": "le1cd2ef3gh4",
      "type": "battle_result",
      "title": "제로와의 대결에서 승리",
      "description": "...",
      "source_type": "battle",
      "occurred_at": "2026-02-17T18:00:00Z"
    }
  ]
}
```

---

## DB 스키마

### characters

계정당 1개의 캐릭터.

```sql
CREATE TABLE characters (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  faction text NOT NULL CHECK (faction IN ('bureau', 'static', 'defector')),
  ability_class text NULL CHECK (ability_class IN ('field', 'empathy', 'shift', 'compute')),
  hp_max integer NOT NULL,
  hp_current integer NOT NULL,
  will_max integer NOT NULL,
  will_current integer NOT NULL,
  profile_image_url text NULL,
  appearance text NULL,
  backstory text NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'revision')),
  rejection_reason text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  UNIQUE(user_id, deleted_at)
);
```

#### RLS
- 승인된 캐릭터: 전체 공개 읽기
- 본인 캐릭터: 상태 무관 읽기
- Admin: 전체 읽기/수정
- 본인만 생성/수정/삭제

---

### abilities

캐릭터당 3개의 능력 (basic/mid/advanced).

```sql
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
```

#### RLS
- 승인된 캐릭터의 능력: 전체 공개
- 본인 캐릭터 능력: 읽기/생성/수정/삭제

---

### character_lore

캐릭터 서사 타임라인.

```sql
CREATE TABLE character_lore (
  id text PRIMARY KEY,
  character_id text NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  source_type text NOT NULL CHECK (source_type IN ('battle', 'room', 'admin')),
  source_id text NULL,
  summary text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);
```

#### RLS
- 승인된 캐릭터의 서사: 전체 공개
- Admin만 생성/수정/삭제

---

### character_relationships

캐릭터 관계도.

```sql
CREATE TABLE character_relationships (
  id text PRIMARY KEY,
  character_id text NOT NULL REFERENCES characters(id),
  target_id text NOT NULL REFERENCES characters(id),
  label text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(character_id, target_id)
);
```

#### RLS
- 승인된 캐릭터 보유 유저: 전체 읽기
- 본인 캐릭터의 관계만 생성/수정/삭제

---

### civilian_merits (deprecated)

비능력자 메리트 (정적 시드 데이터).

```sql
CREATE TABLE civilian_merits (
  id text PRIMARY KEY,
  name text UNIQUE NOT NULL,
  description text NOT NULL,
  effect text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);
```

---

### 관련 인덱스

```sql
CREATE INDEX idx_characters_user_id ON characters(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_characters_status ON characters(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_characters_faction ON characters(faction) WHERE deleted_at IS NULL;
CREATE INDEX idx_abilities_character_id ON abilities(character_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_character_lore_character_id ON character_lore(character_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_char_rel_character ON character_relationships(character_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_char_rel_target ON character_relationships(target_id) WHERE deleted_at IS NULL;
```

---

### 진영별 초기 스탯 (Application Layer)

```
bureau:   HP 80,  WILL 250
static:   HP 120, WILL 150
defector: HP 100, WILL 200
```
