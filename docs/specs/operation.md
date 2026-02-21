# Operation — 전투/RP 통합

> 전투 RP(오퍼레이션)와 일반 RP(다운타임)를 하나의 허브에서 관리한다.

---

## 화면 (프론트엔드)

### Operation 통합 허브 (`/operation`)

#### 접근 제한
- **승인된 캐릭터(`status = 'approved'`)를 보유한 유저만 접근 가능**
- 미승인/미생성 유저 → AccessDenied 화면 표시

#### 허브 화면 구성
1. **MAIN STORY 배너** (최상단 고정)
   - 운영자가 지정한 메인 스토리 이벤트 (`is_main_story = true && status = 'live'`)
   - 제목, 요약, 참가자 수, 입장 CTA
   - 없으면 비노출
2. **타입 필터:** 전체 / 오퍼레이션 / 다운타임
3. **상태 필터:** 전체 / 대기 / LIVE / 완료
4. **내 참여 방 표시:** 참여 중인 방은 뱃지 또는 상단 정렬로 구분
5. **카드 그리드:** 상태별 컬러 스트라이프 + 참가자 + 요약 + CTA
6. **생성 버튼:**
   - 다운타임: 모든 승인 유저가 생성 가능
   - 오퍼레이션: **운영자(admin)만 생성 가능**

#### 방 상태 (공통)
| 상태 | 설명 |
|------|------|
| `waiting` (대기) | 생성됨, 아직 시작 전 |
| `live` (진행 중) | 활성 세션 |
| `completed` (완료) | 종료됨, 열람 가능 (아카이브) |

#### 관전 모드 (공통)
- 모든 승인 유저는 `live` 또는 `completed` 상태의 방을 **관전(읽기 전용)**할 수 있다
- 관전자는 채팅 로그를 볼 수 있으나 입력 불가
- Supabase Realtime으로 실시간 반영

---

### 오퍼레이션 — 전투 RP (`/operation/[id]`)

**운영자(GM)가 생성하는 전투 세션. 최대 4명(2v2).**

#### 인원 및 팀 구성
- **최소 2명, 최대 4명** (1v1 또는 2v2)
- 팀 편성: ALLY / ENEMY (운영자가 생성 시 지정)

#### 화면 구성 (카톡 형태 채팅 UI)
- **상단 바:** 전투 제목 + TURN 카운터 + 뒤로가기
- **HP/WILL 바:** 참가자별 스탯 바 (팩션 컬러 코딩). WILL은 접기/펼치기
- **전투 로그:** 풀스크린 채팅
  - 내 서술: 오른쪽 말풍선 (행동 뱃지: 공격/방해/방어/지원)
  - 상대 서술: 왼쪽 말풍선
  - GM 판정: JudgmentCard (4점 채점 + 스탯 변동)
  - GM 서사: 중앙 이탤릭 (씬 설정, 에필로그)
  - 시스템: 턴 구분선
- **하단 입력 영역:**
  - 행동 유형 칩 4개 (공격/방해/방어/지원) + 능력/대상 드롭다운
  - 코스트 미리보기 (HP/WILL before → after)
  - 서술 텍스트 입력 + 제출 버튼

#### 턴 사이클
1. 각 참가자가 행동 유형 + 능력 + 대상 + 서술을 제출
2. 양측 모두 제출 완료 → "양측 서술 완료" 표시
3. AI GM 판정 실행 (4점 채점: 서술 합리성/전술/대가 반영/서술 품질)
4. 판정 결과 + HP/WILL 변동 표시
5. 다음 턴

#### 판정 기준
- 서술 합리성 30% / 전술 25% / 대가 반영 20% / 누적 피로 15% / 서술 품질 10%
- 결과 등급: Critical Success / Success / Partial / Failure / Critical Failure

#### 타임아웃
- **10분.** 미제출 시 자동 패스 (auto-fail)

#### 전투 종료 조건
- HP 0 → 전투불능 (사망은 플레이어 동의 시에만)
- 운영자 수동 종료

---

### 다운타임 — 일반 RP (`/room/[id]`)

**승인된 유저 누구나 생성 가능한 자유 RP방. 인원 제한 없음.**

#### 방 생성
- 제목 + 설명 (상황 설정)
- 참가자 초대 (캐릭터 도감에서 선택 또는 링크 공유)

#### 방 내부 (카톡 형태)
- 참가자 서술: 말풍선 (캐릭터 이미지 + 이름)
- 시스템 메시지: 입장/퇴장, 서사 반영 알림

#### 서사 반영 기능
- **"서사 반영 요청" 버튼** → 참가자 전원 합의 (전원 동의 버튼 클릭)
- 전원 합의 시 → 선택된 구간의 대화 로그를 AI에게 전송
- AI가 서사 요약 추출 → 각 참가 캐릭터의 서사 기록 타임라인에 반영
- **스탯(HP/WILL) 변동 없음.** 서사 기록만.

---

## 전투 시스템

> 전투 규칙, AI GM 아키텍처, 판정 공식, 데이터 계약은 [`combat-system.md`](./combat-system.md) 참조.
>
> 주요 내용: 4-Phase 파이프라인 (권력 분립), MVP 판정 3단계, base_damage 테이블,
> 코스트 선차감, 2:2 확장 규칙, TypeScript 데이터 계약, Realtime 이벤트 스펙.

---

## API (백엔드)

> **TODO:** 현재 API는 구 모델(1v1 Battles + 별도 Rooms)을 기준으로 작성됨.
> 구현 시 통합 Operations API로 재설계 필요:
> - `POST /api/operations` — 오퍼레이션(admin만) 또는 다운타임(승인 유저) 생성
> - `GET /api/operations` — 통합 목록 (type/status 필터)
> - `GET /api/operations/[id]` — 상세 + 참가자 + 최근 메시지/턴
> - `POST /api/operations/[id]/join` — 참가
> - `POST /api/operations/[id]/turns` — 서술 제출 (오퍼레이션)
> - `POST /api/operations/[id]/messages` — 메시지 전송 (다운타임)
> - `POST /api/operations/[id]/lore` — 서사 반영 요청 (다운타임)

### 기존 Battles API (참조용 — 통합 시 재설계)

주요 엔드포인트:
- `POST /api/battles` — 전투 생성 (1v1, 구 모델)
- `GET /api/battles` — 전투 목록
- `GET /api/battles/:id` — 전투 상세 + 턴 로그
- `POST /api/battles/:id/accept` — 전투 수락
- `POST /api/battles/:id/turns` — 서술 제출
- `POST /api/battles/:id/judge` — AI GM 판정 트리거
- `POST /api/battles/:id/pause` — 중단 요청
- `GET /api/battles/:id/ooc` — OOC 채팅

### 기존 Rooms API (참조용 — 통합 시 재설계)

주요 엔드포인트:
- `POST /api/rooms` — RP 방 생성
- `GET /api/rooms` — 방 목록
- `GET /api/rooms/:id` — 방 상세 + 메시지
- `POST /api/rooms/:id/join` — 참가
- `POST /api/rooms/:id/messages` — 메시지 전송
- `POST /api/rooms/:id/lore` — 서사 반영 요청
- `POST /api/rooms/:id/lore/:requestId/vote` — 서사 반영 투표

---

## DB 스키마

> **TODO:** 현재 DB는 구 모델(battles + rooms 별도 테이블)을 기준으로 작성됨.
> 구현 시 통합 모델로 재설계 필요:
> - `operations` 테이블: type ENUM('operation', 'downtime'), status ENUM('waiting', 'live', 'completed')
> - `operation_participants`: team ENUM('bureau', 'static', 'defector') — 캐릭터 faction 기준
> - `operation_turns`: 오퍼레이션 전투 턴 로그
> - `operation_messages`: 다운타임 RP 메시지
> - 기존 1v1 (challenger/defender) → 2v2 팀 모델 (max 4)

### 기존 battles 테이블 (참조용)

```sql
CREATE TABLE battles (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text NULL,
  challenger_id text NOT NULL REFERENCES characters(id),
  defender_id text NULL REFERENCES characters(id),
  status text NOT NULL DEFAULT 'open' CHECK (
    status IN ('open', 'accepted', 'in_progress', 'paused', 'completed', 'cancelled')
  ),
  current_turn text NULL CHECK (current_turn IN ('challenger', 'defender')),
  turn_number integer NOT NULL DEFAULT 0,
  turn_deadline timestamptz NULL,
  result jsonb NULL,
  pause_requested_by text NULL REFERENCES characters(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);
```

### 기존 battle_turns 테이블 (참조용)

```sql
CREATE TABLE battle_turns (
  id text PRIMARY KEY,
  battle_id text NOT NULL REFERENCES battles(id),
  turn_number integer NOT NULL,
  attacker_id text NOT NULL REFERENCES characters(id),
  attacker_text text NOT NULL,
  attacker_submitted_at timestamptz NULL,
  attacker_edited boolean NOT NULL DEFAULT false,
  attacker_agreed boolean NOT NULL DEFAULT false,
  defender_id text NOT NULL REFERENCES characters(id),
  defender_text text NULL,
  defender_submitted_at timestamptz NULL,
  defender_edited boolean NOT NULL DEFAULT false,
  defender_agreed boolean NOT NULL DEFAULT false,
  gm_judgment text NULL,
  hp_changes jsonb NULL,
  will_changes jsonb NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  UNIQUE(battle_id, turn_number, deleted_at)
);
```

### 기존 battle_ooc 테이블 (참조용)

```sql
CREATE TABLE battle_ooc (
  id text PRIMARY KEY,
  battle_id text NOT NULL REFERENCES battles(id),
  character_id text NOT NULL REFERENCES characters(id),
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);
```

### 기존 rooms 테이블 (참조용)

```sql
CREATE TABLE rooms (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text NULL,
  created_by text NOT NULL REFERENCES characters(id),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);
```

### 기존 room_participants 테이블 (참조용)

```sql
CREATE TABLE room_participants (
  id text PRIMARY KEY,
  room_id text NOT NULL REFERENCES rooms(id),
  character_id text NOT NULL REFERENCES characters(id),
  joined_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  UNIQUE(room_id, character_id, deleted_at)
);
```

### 기존 room_messages 테이블 (참조용)

```sql
CREATE TABLE room_messages (
  id text PRIMARY KEY,
  room_id text NOT NULL REFERENCES rooms(id),
  character_id text NULL REFERENCES characters(id),
  message text NOT NULL,
  is_system boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);
```

### Lore System (서사 반영)

```sql
CREATE TABLE lore_requests (
  id text PRIMARY KEY,
  room_id text NOT NULL REFERENCES rooms(id),
  requested_by text NOT NULL REFERENCES characters(id),
  message_range_start text NOT NULL,
  message_range_end text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  ai_summary text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);

CREATE TABLE lore_request_votes (
  id text PRIMARY KEY,
  lore_request_id text NOT NULL REFERENCES lore_requests(id),
  character_id text NOT NULL REFERENCES characters(id),
  agreed boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  UNIQUE(lore_request_id, character_id, deleted_at)
);
```

### 관련 인덱스

```sql
CREATE INDEX idx_battles_status ON battles(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_battles_turn_deadline ON battles(turn_deadline) WHERE status IN ('in_progress', 'paused') AND deleted_at IS NULL;
CREATE INDEX idx_battle_turns_battle_id ON battle_turns(battle_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_rooms_status ON rooms(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_room_messages_room_id ON room_messages(room_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_room_messages_created_at ON room_messages(room_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_lore_requests_room_id ON lore_requests(room_id) WHERE deleted_at IS NULL;
```
