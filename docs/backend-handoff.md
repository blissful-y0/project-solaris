# SOLARIS — 백엔드 구현 사양서 (Operation API)

> 작성일: 2026-02-20
> 대상: 백엔드 구현 팀
> 범위: Operation(전투 RP) / Downtime(일반 RP) 기능 백엔드 전체
> 기준: feat/operation-front 프론트엔드 구현 완료 시점 기준

---

## 0. 읽기 전에

이 문서는 프론트엔드가 이미 완성된 상태에서 실제 백엔드 연동을 위해 작성된 **구현 핸드오프 문서**다.
아래 문서를 함께 참조한다:

- `docs/specs/operation.md` — 기능 스펙
- `docs/specs/_overview.md` — 프로젝트 공통 규칙, 디자인 시스템
- `docs/specs/character.md` — 캐릭터 데이터 모델
- `docs/specs/auth.md` — 인증 플로우
- `combat-system-rules.md` — 전투 판정 상세 공식

---

## 1. 기능 개요

### 1.1 Operation (전투 RP)

- 생성: **Admin만 가능**
- 참가: `character.status = 'approved'` 유저만
- 구조: NvN 팀 전투 (ALLY vs ENEMY) — 1v1, 2v2 지원, 3v3·4v4 등 차후 확장 가능
- 진행: 턴제 — 양측 서술 제출 → AI GM(HELIOS) 판정 → 스탯 변동
- 완료: HP 0 또는 Admin 수동 종료

### 1.2 Downtime (일반 RP)

- 생성: `character.status = 'approved'` 유저면 누구든
- 참가: 링크 공유로 자유 참가
- 구조: 자유 서술 채팅 (팀 없음, 스탯 변동 없음)
- 서사 반영: 참가자 전원 동의 시 캐릭터 Lore 타임라인 반영

### 1.3 공통 상태 흐름

```
waiting (대기)
  └─ Admin/생성자가 시작
live (진행 중)
  └─ Admin 수동 종료 또는 승리 조건 달성
completed (완료)
  └─ 관전 모드 전환 (승인 유저 읽기 전용)
```

---

## 2. DB 스키마

### 2.1 operations

```sql
CREATE TABLE operations (
  id                text        PRIMARY KEY DEFAULT nanoid(),
  title             text        NOT NULL,
  summary           text        NULL,
  type              text        NOT NULL CHECK (type IN ('operation', 'downtime')),
  status            text        NOT NULL DEFAULT 'waiting'
                                CHECK (status IN ('waiting', 'live', 'completed')),
  created_by        text        NOT NULL REFERENCES characters(id),
  is_main_story     boolean     NOT NULL DEFAULT false,
  max_participants  integer     NOT NULL DEFAULT 4,
  -- operation 기본 4 (1v1=2, 2v2=4), downtime은 생성 시 지정

  -- Operation 전용
  current_turn   integer     NOT NULL DEFAULT 0,
  turn_deadline  timestamptz NULL,

  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  deleted_at     timestamptz NULL
);
```

**프론트가 기대하는 API 응답 필드 (`OperationItem`):**

| DB 컬럼 | API 필드 | 비고 |
|---------|---------|------|
| id | id | |
| title | title | |
| type | type | `"operation"` \| `"downtime"` |
| status | status | `"waiting"` \| `"live"` \| `"completed"` |
| summary | summary | |
| is_main_story | isMainStory | camelCase 변환 필수 |
| created_at | createdAt | ISO 8601 |
| (join) | teamA | **항상 포함**. operation: ALLY 팀 멤버 `[{id, name}]` / downtime: `[]` |
| (join) | teamB | **항상 포함**. operation: ENEMY 팀 멤버 `[{id, name}]` / downtime: `[]` |
| (join) | host | **항상 포함**. downtime: `operations.created_by` → `{id, name}` / operation: `{ id: "", name: "" }` |
| max_participants | maxParticipants | DB에 저장. operation 기본값 4, downtime은 생성 시 설정 |

> **teamA/teamB/host 패딩 규칙:** 프론트 `OperationItem` 타입이 세 필드를 모두 required로 선언하므로,
> 타입 불일치를 막기 위해 해당 없는 필드는 빈 배열(`[]`) 또는 빈 객체(`{ id: "", name: "" }`)로 패딩한다.
> operation에서 `host`를 사용하거나 downtime에서 `teamA`/`teamB`를 사용하는 일은 없으므로 값은 무시된다.

---

### 2.2 operation_participants

```sql
CREATE TABLE operation_participants (
  id            text        PRIMARY KEY DEFAULT nanoid(),
  operation_id  text        NOT NULL REFERENCES operations(id),
  character_id  text        NOT NULL REFERENCES characters(id),
  team          text        NULL CHECK (team IN ('ally', 'enemy')),
                            -- operation만 사용, downtime은 NULL
  joined_at     timestamptz NOT NULL DEFAULT now(),
  -- created_at과 동일 목적. 둘 중 하나만 사용해도 무방 (하위 호환용으로 유지)
  created_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz NULL
);
```

---

### 2.3 operation_turns + operation_turn_actions + operation_turn_judgments (Operation 전용, NvN 지원)

```sql
CREATE TABLE operation_turns (
  id              text        PRIMARY KEY DEFAULT nanoid(),
  operation_id    text        NOT NULL REFERENCES operations(id),
  turn_number     integer     NOT NULL,
  phase           text        NOT NULL DEFAULT 'collecting'
                  CHECK (phase IN ('collecting', 'both_submitted', 'judging', 'resolved')),

  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz NULL
);

CREATE TABLE operation_turn_actions (
  id              text        PRIMARY KEY DEFAULT nanoid(),
  operation_id    text        NOT NULL REFERENCES operations(id),
  turn_id         text        NOT NULL REFERENCES operation_turns(id),
  participant_id  text        NOT NULL REFERENCES characters(id),
  -- 의도적 명명: 전투 턴 문맥의 "참가자"를 의미하며, 실제 FK 대상은 characters.id
  -- 즉 participant_id는 이 문서에서 character_id와 동일한 식별자를 가리킨다.
  team            text        NOT NULL CHECK (team IN ('ally', 'enemy')),
  action_type     text        NOT NULL CHECK (action_type IN ('attack', 'defend', 'support')),
  ability_id      text        NOT NULL REFERENCES abilities(id),
  target_id       text        NOT NULL REFERENCES characters(id),
  description     text        NOT NULL,
  cost_hp         integer     NOT NULL DEFAULT 0,
  cost_will       integer     NOT NULL DEFAULT 0,
  submitted_at    timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz NULL
);

CREATE TABLE operation_turn_judgments (
  id                text        PRIMARY KEY DEFAULT nanoid(),
  operation_id      text        NOT NULL REFERENCES operations(id),
  turn_id           text        NOT NULL REFERENCES operation_turns(id),
  participant_id    text        NOT NULL REFERENCES characters(id),
  -- 의도적 명명: 전투 판정 대상 참가자(= characters.id)
  grade_5scale      text        NOT NULL
                    CHECK (grade_5scale IN (
                      'critical_success', 'success', 'partial', 'failure', 'critical_failure'
                    )),
  score_narrative   integer     NOT NULL,
  score_tactical    integer     NOT NULL,
  score_cost        integer     NOT NULL,
  score_fatigue     integer     NOT NULL,
  score_quality     integer     NOT NULL,
  -- 스탯 변동 (이 턴에서 이 참가자에게 발생한 HP/WILL 변화)
  hp_before         integer     NOT NULL,
  hp_after          integer     NOT NULL,
  will_before       integer     NOT NULL,
  will_after        integer     NOT NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  deleted_at        timestamptz NULL
);
```

> **[NvN 지원] 턴 데이터는 정규화 구조로 저장한다.**
> - `operation_turns`: 턴 메타(번호/phase)
> - `operation_turn_actions`: 참가자별 제출 액션(턴당 참가자 수만큼)
> - `operation_turn_judgments`: 참가자별 판정 점수/등급(턴당 참가자 수만큼)
> 1v1, 2v2, 3v3, 4v4 등 어떤 구성도 동일 모델로 처리하며, 참가자 수는 `operations.max_participants`로 제어한다.
> 전투 로그(`operation_turns`, `operation_turn_actions`, `operation_turn_judgments`)는 append-only 원칙을 따른다.
> 운영 중 기존 로그 UPDATE/DELETE를 지양하고, 정정이 필요하면 보정 레코드를 추가로 남긴다.
> `participant_id`는 반드시 해당 operation 참가자(`operation_participants`)와 일치해야 하며,
> 서비스 레이어 + DB 트리거로 이 제약을 이중 강제한다.
> `operation_turn_actions.operation_id` / `operation_turn_judgments.operation_id`는
> `turn_id`가 가리키는 `operation_turns.operation_id`와 반드시 일치해야 한다.
> (서비스 레이어 + DB 트리거 이중 강제)

**프론트가 기대하는 `JudgmentResult` 구조:**

```typescript
{
  turn: number,
  participantResults: [
    {
      participantId: string,
      participantName: string,
      grade: "success" | "partial" | "fail",
      // ↑ 프론트는 3단계 표시. DB의 5단계(critical_success/success/partial/failure/critical_failure)를
      //   API가 매핑해서 반환:
      //   critical_success → "success", success → "success"
      //   partial → "partial"
      //   failure → "fail", critical_failure → "fail"
      //   (데미지 배율 계산은 DB 5단계 기준으로 서버에서 처리, 프론트는 표시용 3단계만 수신)
      scores: {
        narrative: number,  // 서술 합리성 /10
        tactical:  number,  // 전술 /10
        cost:      number,  // 대가 반영 /10
        quality:   number,  // 서술 품질 /10
        // 누적 피로(fatigue)는 AI가 판정 산출에만 사용, 프론트 표시 점수에서는 제외
      }
    }
  ],
  statChanges: [
    { participantId, participantName, stat: "hp"|"will", before, after, reason }
  ]
}
```

---

### 2.4 operation_messages (채팅 메시지 공용 — Downtime + Operation)

```sql
CREATE TABLE operation_messages (
  id            text        PRIMARY KEY DEFAULT nanoid(),
  operation_id  text        NOT NULL REFERENCES operations(id),
  character_id  text        NULL REFERENCES characters(id),
  -- NULL 허용: is_system=true인 시스템 메시지, gm_narration/judgment 등 발신자 없는 메시지
  type          text        NOT NULL DEFAULT 'narration'
                            CHECK (type IN ('narration', 'judgment', 'system', 'gm_narration')),
  -- narration: 참가자 서술 (Downtime 채팅, Operation 서술 버블)
  -- judgment: GM 판정 카드 (judgment_data JSONB 포함)
  -- gm_narration: HELIOS 나레이션 텍스트
  -- system: 입장/퇴장 등 시스템 메시지
  content       text        NOT NULL DEFAULT '',
  -- judgment/gm_narration 타입: content에 빈 문자열('') 또는 대표 요약 텍스트 저장
  -- narration/system 타입: 실제 표시 텍스트
  judgment_data jsonb       NULL,
  -- type='judgment'일 때: { turn, participantResults, statChanges }
  -- 기타 타입은 NULL
  is_system     boolean     NOT NULL DEFAULT false,
  -- type='system'이면 true, 나머지(narration/judgment/gm_narration)는 false
  -- 하위 호환용으로 유지. 신규 코드는 type 컬럼 사용
  created_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz NULL
);
```

> **주의:** Operation 전투 메시지(서술 버블, GM 나레이션, 판정 카드)도 동일 테이블에 저장한다.
> operation_turns는 판정 원본 데이터 보존용, operation_messages는 채팅 스트림 렌더링용으로 역할이 분리된다.

---

### 2.5 lore_requests + lore_request_segments + lore_request_votes (Downtime 서사 반영)

```sql
CREATE TABLE lore_requests (
  id             text        PRIMARY KEY DEFAULT nanoid(),
  operation_id   text        NOT NULL REFERENCES operations(id),
  requested_by   text        NOT NULL REFERENCES characters(id),
  -- 하위 호환용 파생 필드: INSERT 트랜잭션 내에서 segments(order_index ASC)의 첫/마지막 messageId로 채움
  -- 절대 NULL로 남겨두지 않는다 — 세그먼트 없는 요청은 허용하지 않음
  start_message_id text      NOT NULL REFERENCES operation_messages(id),
  end_message_id   text      NOT NULL REFERENCES operation_messages(id),
  status         text        NOT NULL DEFAULT 'voting'
                             CHECK (status IN ('voting', 'approved', 'rejected')),
  ai_summary     text        NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  deleted_at     timestamptz NULL
);

CREATE TABLE lore_request_segments (
  id                   text        PRIMARY KEY DEFAULT nanoid(),
  lore_request_id      text        NOT NULL REFERENCES lore_requests(id),
  operation_id         text        NOT NULL REFERENCES operations(id),
  message_id           text        NOT NULL REFERENCES operation_messages(id),
  start_offset         integer     NULL,  -- v1: 사용 안 함(NULL 고정), v1.1 부분 선택 도입 시 사용
  end_offset           integer     NULL,  -- v1: 사용 안 함(NULL 고정), v1.1 부분 선택 도입 시 사용
  selected_text_snapshot text      NOT NULL, -- 선택 당시 텍스트 스냅샷(감사/재현용)
  order_index          integer     NOT NULL DEFAULT 0,
  created_at           timestamptz NOT NULL DEFAULT now(),
  deleted_at           timestamptz NULL
);

CREATE TABLE lore_request_votes (
  id               text        PRIMARY KEY DEFAULT nanoid(),
  lore_request_id  text        NOT NULL REFERENCES lore_requests(id),
  operation_id     text        NOT NULL REFERENCES operations(id),
  character_id     text        NOT NULL REFERENCES characters(id),
  vote             text        NOT NULL CHECK (vote IN ('reflect', 'skip')),
  created_at       timestamptz NOT NULL DEFAULT now(),
  deleted_at       timestamptz NULL
);
```

**프론트가 기대하는 `NarrativeRequest` 구조:**

```typescript
{
  id: string,
  requesterId: string,
  rangeStart: string,    // 하위 호환용(segments 정렬 후 첫 messageId)
  rangeEnd: string,      // 하위 호환용(segments 정렬 후 마지막 messageId)
  segments: [
    {
      messageId: string,
      startOffset: null, // v1: 항상 null
      endOffset: null,   // v1: 항상 null
      selectedText: string
    }
  ],
  status: "voting" | "approved" | "rejected",
  votes: Record<string, "reflect" | "skip">,  // { [characterId]: vote }
  totalParticipants: number
}
```

> 설계 원칙: lore_requests는 "요청 메타", lore_request_segments는 "실제 선택 구간"을 저장한다.
> 메시지 원문은 불변(soft delete)으로 취급하고, 선택 텍스트는 snapshot으로 보존한다.
> v1은 "메시지 전체 선택"만 지원한다. (부분 오프셋 선택은 v1.1에서 확장)
> `rangeStart/rangeEnd`는 하위 호환용 파생 필드이며, `segments`를 `order_index ASC` 정렬했을 때
> 첫 번째/마지막 `messageId`로 계산해 저장한다.
> `lore_request_segments.operation_id`는 `lore_requests.operation_id`와 동일해야 하며,
> `message_id` 역시 동일 operation 소속 메시지만 허용한다(서비스 레이어/DB 트리거로 강제).
> `lore_request_votes.operation_id`도 `lore_requests.operation_id`와 반드시 일치해야 한다.
> (Realtime 구독 필터링/무결성 보장을 위해 서비스 + DB 트리거 이중 강제)

**무결성 강제 방식(확정):**
- 서비스 레이어: 요청 처리 시 `lore_request_id`, `operation_id`, `message_id`의 operation 일치 여부를 먼저 검증하고
  불일치 시 400(`INVALID_SEGMENT_OPERATION`)으로 명시적 실패 처리한다.
- DB 트리거: 최종 방어선으로 동일 검증을 재수행해 우회 경로(직접 SQL, 배치, 신규 엔드포인트 누락)에서도
  불일치 데이터를 차단한다.

**구현 체크(필수):**
- `lore_request_votes.operation_id` 일치 강제를 실제 DB 트리거 SQL로 구현한다.
  (문서 설명만 두고 마이그레이션에서 누락하지 않도록 주의)

---

### 2.6 인덱스

```sql
CREATE INDEX idx_operations_status   ON operations(status)  WHERE deleted_at IS NULL;
CREATE INDEX idx_operations_type     ON operations(type)    WHERE deleted_at IS NULL;
CREATE INDEX idx_operations_main     ON operations(is_main_story, status)
  WHERE deleted_at IS NULL AND is_main_story = true;

CREATE INDEX idx_op_participants_op  ON operation_participants(operation_id)
  WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX uq_op_participants_active
  ON operation_participants(operation_id, character_id)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_op_turns_op         ON operation_turns(operation_id)
  WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX uq_op_turns_active
  ON operation_turns(operation_id, turn_number)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_turn_actions_turn   ON operation_turn_actions(turn_id)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_turn_judgments_turn ON operation_turn_judgments(turn_id)
  WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX uq_turn_actions_participant_active
  ON operation_turn_actions(turn_id, participant_id)
  WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX uq_turn_judgments_participant_active
  ON operation_turn_judgments(turn_id, participant_id)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_op_messages_op_time ON operation_messages(operation_id, created_at DESC)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_lore_req_op         ON lore_requests(operation_id)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_lore_segments_req   ON lore_request_segments(lore_request_id, order_index)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_lore_votes_op       ON lore_request_votes(operation_id)
  WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX uq_lore_votes_active
  ON lore_request_votes(lore_request_id, character_id)
  WHERE deleted_at IS NULL;
```

### 2.7 updated_at 자동 갱신 트리거

```sql
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- operations, operation_turns 각각 적용
CREATE TRIGGER trg_operations_updated_at
  BEFORE UPDATE ON operations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_operation_turns_updated_at
  BEFORE UPDATE ON operation_turns
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

---

## 3. REST API 명세

> 기존 API 패턴 준수: 성공 `{ data: {...} }`, 실패 `{ error: "ERROR_CODE", detail?: string }`

### 3.1 Operation 목록

#### `GET /api/operations`

**Query Params:**

| 파라미터 | 타입 | 기본값 | 설명 |
|---------|------|--------|------|
| type | `"operation"` \| `"downtime"` \| `"all"` | `"all"` | 타입 필터 |
| status | `"waiting"` \| `"live"` \| `"completed"` \| `"all"` | `"all"` | 상태 필터 |

**응답 `200`:**

```json
{
  "data": [
    {
      "id": "op-abc123",
      "title": "심층 구역 이상 징후",
      "type": "operation",
      "status": "live",
      "summary": "HELIOS 최우선 작전 지시...",
      "isMainStory": true,
      "maxParticipants": 4,
      "createdAt": "2026-02-15T09:00:00Z",
      "teamA": [
        { "id": "ch-001", "name": "아마츠키 레이" }
      ],
      "teamB": [
        { "id": "ch-003", "name": "나디아 볼코프" }
      ],
      "host": { "id": "", "name": "" }
    },
    {
      "id": "dt-xyz789",
      "title": "아케이드 구역 다운타임",
      "type": "downtime",
      "status": "waiting",
      "summary": "...",
      "isMainStory": false,
      "maxParticipants": 8,
      "createdAt": "2026-02-18T14:00:00Z",
      "teamA": [],
      "teamB": [],
      "host": { "id": "ch-002", "name": "카이 안데르센" }
    }
  ]
}
```

**권한:** `character.status = 'approved'` 필수
**RLS:** 삭제되지 않은(`deleted_at IS NULL`) 전체 목록 반환

---

#### `POST /api/operations`

**Request Body (operation):**

```json
{
  "title": "구역 7-B 정찰 작전",
  "summary": "작전 배경 설명",
  "type": "operation",
  "teamA": ["ch-001"],
  "teamB": ["ch-003", "ch-004"],
  "maxParticipants": 4,
  "isMainStory": false
}
```

**Request Body (downtime):**

```json
{
  "title": "아케이드 구역 다운타임",
  "summary": "자유 서술 채팅",
  "type": "downtime",
  "maxParticipants": 8
}
```

> downtime 생성 시 `teamA`, `teamB`, `isMainStory`는 불필요. 무시하거나 400으로 거부한다.

**응답 `201`:**

```json
{
  "data": {
    "id": "op-newid123",
    "title": "구역 7-B 정찰 작전",
    "type": "operation",
    "status": "waiting",
    ...
  }
}
```

**권한:**
- `type = "operation"` → Admin만
- `type = "downtime"` → `character.status = 'approved'` 유저면 누구든

**에러:**

| 코드 | 상황 |
|------|------|
| `FORBIDDEN` (403) | operation 생성을 admin이 아닌 유저가 시도 |
| `INVALID_TEAM` (400) | operation인데 teamA 또는 teamB가 비어있음 |
| `CHARACTER_NOT_FOUND` (404) | teamA/teamB에 없는 캐릭터 ID 포함 |

---

### 3.2 Operation 상세 (세션 진입)

#### `GET /api/operations/[id]`

**응답 `200`:**

```json
{
  "data": {
    "id": "op-abc123",
    "title": "구역 7-B 정찰 작전",
    "type": "operation",
    "status": "live",
    "currentTurn": 3,
    "phase": "my_turn",
    // ↑ currentTurn, phase는 type="operation"일 때만 존재. downtime이면 생략.
    "myParticipantId": "ch-001",
    // ↑ 현재 요청자의 character ID. 비참가자(관전자)는 null.
    "participants": [
      {
        "id": "ch-001",
        "name": "아마츠키 레이",
        "faction": "bureau",
        "team": "ally",
        "hp": { "current": 49, "max": 80 },
        "will": { "current": 193, "max": 250 },
        "abilities": [
          {
            "id": "a1",
            "name": "역장 전개",
            "tier": "basic",
            "costHp": 0,
            "costWill": 5
          }
        ]
      }
    ],
    "messages": [
      {
        "id": "msg-001",
        "type": "gm_narration",
        "content": "HELIOS 판정 결과...",
        "timestamp": "2026-02-15T09:05:00Z"
      },
      {
        "id": "msg-002",
        "type": "narration",
        "senderId": "ch-001",
        "senderName": "아마츠키 레이",
        "senderAvatarUrl": "https://...",
        "content": "서술 내용...",
        "timestamp": "2026-02-15T09:06:00Z",
        "isMine": true,
        "action": {
          "actionType": "attack",
          "abilityName": "역장 전개",
          "targetName": "나디아 볼코프"
        }
      },
      {
        "id": "msg-003",
        "type": "judgment",
        "timestamp": "2026-02-15T09:10:00Z",
        "judgment": {
          "turn": 3,
          "participantResults": [...],
          "statChanges": [...]
        }
      }
    ],
    "summary": "작전 배경 설명",
    "isMainStory": false,
    "createdAt": "2026-02-15T09:00:00Z"
  }
}
```

**타입별 응답 필드 분기:**

| 필드 | type=operation | type=downtime |
|------|---------------|---------------|
| `currentTurn` | 포함 | 생략 |
| `phase` | 포함 | 생략 |
| `myParticipantId` | character ID (비참가자: null) | 생략 |
| `participants` | 포함 (HP/WILL/abilities) | 생략 |
| `messages` | 포함 | 포함 |

**TurnPhase 계산 로직 (서버, operation 전용):**

DB `operation_turns.phase`와 프론트 `TurnPhase`의 매핑:

| DB phase | 추가 조건 | 프론트 TurnPhase |
|----------|----------|----------------|
| `collecting` | 내 action 미제출 | `"my_turn"` |
| `collecting` | 내 action 제출, 상대 미제출 | `"waiting"` |
| `both_submitted` | (조건 없음) | `"both_submitted"` |
| `judging` | (조건 없음) | `"judging"` |
| `resolved` | (현재 턴 완료 — 다음 턴의 phase로 계산) | - |

"내 action 제출 여부"는 `operation_turn_actions`에서 `turn_id + participant_id`로 조회한다.

**권한:**
- `status = 'approved'` 유저는 모두 읽기 가능 (관전)
- `operation` 쓰기: 참가자만 가능
- `downtime` 쓰기: `approved` 사용자만 가능

---

### 3.3 전투 Action 제출 (Operation 전용)

#### `POST /api/operations/[id]/submit-action`

**Request Body:**

```json
{
  "actionType": "attack",
  // "attack" | "defend" | "support" — 3종
  "abilityId": "a2",
  "targetId": "ch-003",
  "description": "역장을 압축하여 상대를 밀쳐낸다..."
}
```

> `costHp`, `costWill`은 클라이언트 입력을 받지 않는다.
> 서버가 `abilityId` 기준으로 abilities 테이블에서 조회해 계산/저장한다.

**응답 `200`:**

```json
{
  "data": {
    "messageId": "msg-new",
    "phase": "waiting",
    "submittedAt": "2026-02-15T09:07:00Z"
  }
}
```

> `phase`는 고정값이 아니라 서버 계산값이다.
> - 내가 제출 후 상대 미제출: `"waiting"`
> - 내가 마지막 제출자(참가자 전원 제출 완료): `"both_submitted"`

**처리 흐름:**
1. 현재 유저의 캐릭터 ID로 참가자 확인
2. 현재 턴의 해당 참가자 action이 미제출인지 확인
3. ability 코스트 계산 (abilities 조회로 costHp/costWill 서버 계산)
4. `operation_turn_actions` INSERT + operation_messages INSERT
5. 전원 제출 완료 시 `operation_turns.phase = 'both_submitted'` UPDATE
6. Supabase Realtime → 상대방에게 이벤트 발송

**`both_submitted` 전환 규칙 (서버 저장 상태):**
- 마지막 제출이 들어오면 서버가 즉시 `operation_turns.phase = 'both_submitted'`로 업데이트한다.
- 프론트는 `operation_turns` UPDATE Realtime 이벤트로 `both_submitted`를 수신한다.
- `submit-action`의 action INSERT와 `both_submitted` phase UPDATE는 단일 트랜잭션으로 처리한다.
  (동시 제출 시 레이스 컨디션 방지)

**에러:**

| 코드 | 상황 |
|------|------|
| `NOT_PARTICIPANT` (403) | 참가자가 아닌 유저가 제출 시도 |
| `ALREADY_SUBMITTED` (409) | 이미 이번 턴 서술 제출함 |
| `WRONG_PHASE` (409) | 현재 phase가 제출 불가 상태 |
| `INVALID_ABILITY` (400) | 해당 캐릭터가 보유하지 않은 ability |

---

### 3.4 AI GM 판정 요청 (Operation 전용)

#### `POST /api/operations/[id]/judge`

**Request Body:** 없음 (양측 서술 DB에서 읽음)

**처리 흐름:**
1. `operation_turns.phase = 'both_submitted'` 확인 (아니면 `WRONG_PHASE` 400)
2. `operation_turns.phase = 'judging'` UPDATE (Realtime → 프론트 스피너 표시)
3. AI API (Gemini/Claude) 호출 → 5항목 채점 (누적 피로 포함)
4. 채점 결과 기반 등급 결정(5단계) → 스탯 변동 계산
5. `operation_turn_judgments` INSERT (참가자별 등급/점수/스탯변동 저장)
6. `characters` 테이블 HP/WILL UPDATE
7. `operation_messages` INSERT × 2 (type: `"gm_narration"`, type: `"judgment"`)
8. `operation_turns.phase = 'resolved'` UPDATE
9. HP 0 감지 → 전투 종료(`operations.status = 'completed'`) **또는** 다음 턴 생성:
   - `operation_turns` INSERT (`turn_number = current+1, phase='collecting'`)
   - `operations.current_turn` +1 UPDATE
10. Supabase Realtime → 전체 참가자에게 판정 결과 발송

**응답 `200`:**

```json
{
  "data": {
    "judgment": {
      "turn": 3,
      "participantResults": [...],
      "statChanges": [...]
    },
    "gmNarration": "HELIOS가 판정 결과를 통보한다...",
    "nextPhase": "my_turn",
    "battleEnded": false
  }
}
```

**AI 프롬프트 채점 기준 (combat-system-rules.md 참조):**

| 항목 | 가중치 | API 응답 score 키 |
|------|--------|------------------|
| 서술 합리성 | 30% | `narrative` |
| 전술 | 25% | `tactical` |
| 대가 반영 | 20% | `cost` |
| 누적 피로 | 15% | `fatigue` (DB 저장, 프론트 표시 제외) |
| 서술 품질 | 10% | `quality` |

**판정점수 정의:**
- 판정점수는 AI GM이 참가자별 행동을 항목별로 수치화한 **중간 평가 데이터**다.
- 이 점수로 등급(5단계)과 스탯 변동을 계산하고, 프론트에는 표시용 4개 점수만 전달한다.

> `fatigue`(누적 피로)는 DB의 `operation_turn_judgments.score_fatigue`에 저장하되, 프론트 `JudgmentCard`에는 표시하지 않는다.
> 프론트가 받는 `scores` 객체에는 `narrative`, `tactical`, `cost`, `quality` 4개만 포함한다.

**결과 등급 → 데미지 배율 (combat-system-rules.md 참조):**

| 등급 | 영문 | 배율 |
|------|------|------|
| Critical Success | critical_success | ×1.5 |
| Success | success | ×1.0 |
| Partial | partial | ×0.5 |
| Failure | failure | ×0 |
| Critical Failure | critical_failure | ×0 + 반동 |

---

### 3.5 Downtime 메시지 (Downtime 전용)

#### `POST /api/operations/[id]/messages`

**Request Body:**

```json
{
  "content": "아마츠키는 아케이드의 네온 불빛 아래..."
}
```

**응답 `201`:**

```json
{
  "data": {
    "id": "msg-new",
    "type": "narration",
    "senderId": "ch-001",
    "senderName": "아마츠키 레이",
    "senderAvatarUrl": "https://...",
    "content": "아마츠키는 아케이드의 네온 불빛 아래...",
    "timestamp": "2026-02-18T14:05:00Z",
    "isMine": true
  }
}
```

**Rate limit:** 분당 30건

---

### 3.6 서사 반영 요청 (Downtime 전용)

#### `POST /api/operations/[id]/lore-requests`

> **트랜잭션 필수:** `lore_requests` INSERT + `lore_request_segments` INSERT는 단일 DB 트랜잭션으로 처리한다.
> 중간 단계 실패 시 전체 롤백하여 부분 저장(깨진 요청 데이터)을 방지한다.

**Request Body:**

```json
{
  "segments": [
    {
      "messageId": "msg-004"
    },
    {
      "messageId": "msg-005"
    }
  ]
}
```

**응답 `201`:**

```json
{
  "data": {
    "id": "lr-abc",
    "requesterId": "ch-001",
    "segments": [
      {
        "messageId": "msg-004",
        "startOffset": null,
        "endOffset": null,
        "selectedText": "네온 불빛 아래 아마츠키는 ..."
      },
      {
        "messageId": "msg-005",
        "startOffset": null,
        "endOffset": null,
        "selectedText": "전체 메시지 텍스트 ..."
      }
    ],
    "rangeStart": "msg-004",
    "rangeEnd": "msg-005",
    "status": "voting",
    "votes": {},
    "totalParticipants": 3
  }
}
```

#### `POST /api/operations/[id]/lore-requests/[requestId]/vote`

**Request Body:**

```json
{ "vote": "reflect" }
// 또는 { "vote": "skip" }
// "reflect" | "skip" 두 가지만 허용. 미투표 상태로 완료 처리 없음.
```

**응답 `200`:**

```json
{
  "data": {
    "id": "lr-abc",
    "segments": [
      {
        "messageId": "msg-004",
        "startOffset": null,
        "endOffset": null,
        "selectedText": "네온 불빛 아래 아마츠키는 ..."
      }
    ],
    "rangeStart": "msg-004",
    "rangeEnd": "msg-004",
    "status": "voting",
    "votes": { "ch-001": "reflect", "ch-002": "reflect" },
    "totalParticipants": 3
  }
}
```

**lore-requests 에러:**

| 코드 | 상황 |
|------|------|
| `INVALID_SEGMENTS` (400) | segments 배열이 비어있음 |
| `INVALID_SEGMENT_OPERATION` (400) | segments의 messageId가 이 operation 소속이 아님 |
| `NOT_PARTICIPANT` (403) | 비참가자가 요청 시도 |
| `OPERATION_NOT_DOWNTIME` (400) | operation type에서 서사반영 요청 시도 |

**vote 에러:**

| 코드 | 상황 |
|------|------|
| `ALREADY_VOTED` (409) | 이미 동일 요청에 투표함 |
| `LORE_REQUEST_CLOSED` (409) | 이미 approved/rejected 상태인 요청에 투표 시도 |
| `NOT_PARTICIPANT` (403) | 비참가자가 투표 시도 |

**투표 완료 처리 (서버 내부):**
- `"skip"` 투표가 1건이라도 들어오면 **즉시** `status = "rejected"` 처리한다. (나머지 미투표자 무관)
- 전원이 `"reflect"`를 완료한 경우에만 `status = "approved"` + AI 요약 생성
- 두 경우 모두 완료 시 Realtime 이벤트 발송 (`lore_requests` UPDATE)

> 결정 로직은 비대칭이다:
> - rejected: skip 1표 → 즉시 확정
> - approved: 전원 reflect 완료 후 확정
> 미투표 상태로 방치할 수 없다 — 결국 모두 투표해야 approved가 가능하다.

#### `GET /api/operations/[id]/lore-requests/[requestId]`

Realtime 수신 후 상세 렌더링용 후속 fetch API.
(`lore_requests` INSERT/UPDATE payload에는 `segments`/집계 필드가 충분히 포함되지 않을 수 있음)

**응답 `200`:**

```json
{
  "data": {
    "id": "lr-abc",
    "requesterId": "ch-001",
    "segments": [
      {
        "messageId": "msg-004",
        "startOffset": null,
        "endOffset": null,
        "selectedText": "네온 불빛 아래 아마츠키는 ..."
      }
    ],
    "rangeStart": "msg-004",
    "rangeEnd": "msg-004",
    "status": "voting",
    "votes": { "ch-001": "reflect" },
    "totalParticipants": 3
  }
}
```

**에러:**

| 코드 | 상황 |
|------|------|
| `NOT_FOUND` (404) | lore request가 존재하지 않음 |
| `FORBIDDEN` (403) | 해당 operation 비참가자/비승인 유저 접근 |

---

### 3.7 Operation 상태 변경 (Admin 전용)

#### `PATCH /api/admin/operations/[id]/status`

**Request Body:**

```json
{ "status": "live" }
```

---

## 4. Supabase Realtime 이벤트

모든 채팅/전투 UI는 Supabase Realtime으로 동기화된다.

### 4.1 채널 정의

```
channel: "operation:{operationId}"
```

### 4.2 이벤트 목록

#### 전투(Operation) 이벤트

| 이벤트 | 테이블 | 트리거 | 프론트 처리 |
|--------|--------|--------|------------|
| 상대 서술 수신 | `operation_messages` INSERT | submit-action | ChatLog에 버블 추가 |
| GM 판정 수신 | `operation_messages` INSERT (type=judgment) | judge | JudgmentCard 렌더 + 스탯 업데이트 |
| GM 나레이션 수신 | `operation_messages` INSERT (type=gm_narration) | judge | ChatLog에 나레이션 추가 |
| 양측 제출 완료 전환 | `operation_turns` UPDATE (phase='both_submitted') | submit-action step 5 | ActionInput "판정 진행 가능" 상태 표시 |
| 판정 중 전환 (judging) | `operation_turns` UPDATE (phase='judging') | judge step 2 | ActionInput 스피너/비활성화 표시 |
| 판정 완료 + 다음 턴 | `operations` UPDATE (current_turn, status) | judge step 9 | SessionStatBar 턴 업데이트 + ActionInput 상태 초기화 |

#### 다운타임(Downtime) 이벤트

| 이벤트 | 테이블 | 트리거 | 프론트 처리 |
|--------|--------|--------|------------|
| 타인 메시지 수신 | `operation_messages` INSERT | 메시지 전송 | ChatLog에 버블 추가 |
| 서사반영 요청 수신 | `lore_requests` INSERT | lore-requests 생성 | ChatLog에 NarrativeRequestCard 렌더 (**주의: Realtime payload에 segments 미포함 → `GET /api/operations/[id]/lore-requests/[requestId]` 후속 fetch 필요**) |
| 서사반영 투표 수신 | `lore_request_votes` INSERT | vote 제출 | NarrativeRequestCard 투표 상태 업데이트 |
| 서사반영 완료/거절 | `lore_requests` UPDATE (status) | vote 완료 | NarrativeRequestCard 완료 표시 |

### 4.3 Realtime 구독 패턴 (프론트 참고)

```typescript
// 프론트에서 이렇게 구독할 예정
const channel = supabase
  .channel(`operation:${operationId}`)
  .on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: "operation_messages",
      filter: `operation_id=eq.${operationId}` },
    (payload) => handleNewMessage(payload.new)
  )
  .on(
    "postgres_changes",
    { event: "UPDATE", schema: "public", table: "operation_turns",
      filter: `operation_id=eq.${operationId}` },
    (payload) => handleTurnUpdate(payload.new)
  )
  .on(
    "postgres_changes",
    { event: "UPDATE", schema: "public", table: "operations",
      filter: `id=eq.${operationId}` },
    (payload) => handleOperationUpdate(payload.new)
  )
  .on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: "lore_requests",
      filter: `operation_id=eq.${operationId}` },
    (payload) => handleLoreRequestInsert(payload.new) // 이후 requestId로 상세 fetch
  )
  .on(
    "postgres_changes",
    { event: "UPDATE", schema: "public", table: "lore_requests",
      filter: `operation_id=eq.${operationId}` },
    (payload) => handleLoreRequestUpdate(payload.new)
  )
  .on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: "lore_request_votes",
      filter: `operation_id=eq.${operationId}` },
    (payload) => handleLoreVoteInsert(payload.new)
  )
  .subscribe();
```

> 구현 체크(권장): `handleLoreVoteInsert`는 payload를 그대로 UI에 반영하지 말고
> `lore_request_id` 기준 상세 재조회(또는 캐시 병합 규칙)를 통해 최종 상태를 동기화한다.
> (동시 투표/이벤트 순서 차이로 인한 UI 드리프트 방지)

---

## 5. 권한 및 RLS

### 5.1 캐릭터 상태별 접근 권한

| 상태 | Operation 허브 진입 | Downtime 생성 | 관전 | 참가 |
|------|-------------------|--------------|------|------|
| `null` (미등록) | 불가 | 불가 | 불가 | 불가 |
| `pending` | 불가 | 불가 | 불가 | 불가 |
| `rejected` | 불가 | 불가 | 불가 | 불가 |
| `approved` | 가능 | 가능 | 가능 | 가능 |

> **운영 정책 확정(2026-02-20):**
> - `operation`(전투): 참가자만 메시지 작성 가능
> - `downtime`(일반 채팅): `approved` 사용자만 메시지 작성 가능

### 5.2 Role별 권한

| 권한 | 일반 유저 | Admin |
|------|---------|-------|
| operation 생성 | 불가 | 가능 |
| downtime 생성 | 가능 (approved) | 가능 |
| 상태 변경 | 불가 | 가능 |
| GM 판정 트리거 | 불가 | 가능 (또는 자동) |
| 캐릭터 승인/반려 | 불가 | 가능 |

### 5.3 RLS 정책 (권장)

```sql
-- operations: 승인 유저는 읽기, Admin은 전체
ALTER TABLE operations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "approved_users_can_read_operations"
  ON operations FOR SELECT
  USING (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM characters c
      WHERE c.user_id = auth.uid()
      AND c.status = 'approved'
      AND c.deleted_at IS NULL
    )
  );

-- operation_messages: operation 타입은 참가자만 쓰기
CREATE POLICY "operation_participants_can_insert_messages"
  ON operation_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM operations o
      JOIN operation_participants op
        ON op.operation_id = o.id
      JOIN characters c
        ON c.id = op.character_id
      WHERE o.id = operation_messages.operation_id
        AND o.type = 'operation'
        AND o.deleted_at IS NULL
        AND op.deleted_at IS NULL
        AND c.user_id = auth.uid()
        AND c.status = 'approved'
        AND operation_messages.character_id = c.id
    )
  );

-- operation_messages: downtime 타입은 approved 사용자만 쓰기
CREATE POLICY "downtime_approved_users_can_insert_messages"
  ON operation_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM operations o
      JOIN characters c
        ON c.user_id = auth.uid()
      WHERE o.id = operation_messages.operation_id
        AND o.type = 'downtime'
        AND o.deleted_at IS NULL
        AND c.status = 'approved'
        AND c.deleted_at IS NULL
        AND operation_messages.character_id = c.id
    )
  );
```

> 보안 규칙: `operation_messages.character_id`는 클라이언트 입력을 신뢰하지 않고
> 서버에서 현재 사용자 캐릭터 ID로 강제 주입한다. RLS는 이를 최종 검증한다.

---

## 6. 기존 API 패턴 (준수 필수)

### 6.1 응답 형식

```typescript
// 성공
{ "data": { ... } }          // status: 200 | 201

// 실패
{ "error": "ERROR_CODE", "detail"?: "상세 메시지" }  // status: 4xx | 5xx
```

### 6.2 에러 코드 네이밍

```
UNAUTHENTICATED    — 401 (세션 없음)
FORBIDDEN          — 403 (권한 없음)
NOT_FOUND          — 404 (리소스 없음)
INVALID_*          — 400 (유효성 실패)
*_NOT_FOUND        — 404 (특정 리소스)
ALREADY_*          — 409 (중복/충돌)
INTERNAL_SERVER_ERROR — 500
```

### 6.3 ID 포맷

```
nanoid(12) — 예: "V1StGXR8_Z5j"
검증 정규식: /^[a-zA-Z0-9_-]{1,24}$/
```

### 6.4 Soft Delete

- 모든 테이블에 `deleted_at timestamptz NULL` 필드
- 조회 시 항상 `WHERE deleted_at IS NULL` 조건 포함
- 물리 삭제 불가
- 단, 전투 로그 테이블(`operation_turns`, `operation_turn_actions`, `operation_turn_judgments`)은
  실무 운영 규칙상 append-only로 취급한다. (삭제/수정 대신 보정 레코드 추가)

### 6.5 camelCase ↔ snake_case 변환

- DB: `snake_case` (e.g., `is_main_story`, `created_at`)
- API 응답: `camelCase` (e.g., `isMainStory`, `createdAt`)
- 프론트 TypeScript 타입이 camelCase 기준

---

## 7. 진영별 초기 스탯

```
Bureau (Enforcer):  HP 80,   WILL 250
Static:             HP 120,  WILL 150
Defector (전향자):  HP 100,  WILL 200
```

---

## 8. abilities 테이블 스키마 확인

현재 프론트가 기대하는 `BattleAbility` 구조:

```typescript
{
  id: string,
  name: string,
  tier: "basic" | "mid" | "advanced",
  costHp: number,
  costWill: number,
}
```

**DB에서 매핑해야 할 필드:**

```sql
-- abilities 테이블에 있어야 할 필드
id        text PRIMARY KEY,
name      text NOT NULL,
tier      text CHECK (tier IN ('basic', 'mid', 'advanced')),
cost_hp   integer NOT NULL DEFAULT 0,   -- 구버전 cost_amount/cost_type 아님
cost_will integer NOT NULL DEFAULT 0,
character_id text REFERENCES characters(id),
...
```

> **주의:** 구버전 `cost_amount` / `cost_type` 필드는 이미 `cost_hp` / `cost_will`로 교체됨.

---

## 9. 구현 우선순위

> **구현 방향 확정(2026-02-20): 1차 구현은 Downtime(일반 채팅)부터 진행한다.**

### Phase 1 — Downtime 채팅 연동 (1차 우선)

1. `GET /api/operations` — 목록 조회 API
2. `GET /api/operations/[id]` — 세션 진입 (downtime 우선)
3. `POST /api/operations/[id]/messages` — 메시지 전송
4. Supabase Realtime 구독 (operation_messages INSERT)
5. `POST /api/operations/[id]/lore-requests` — 서사반영 요청
6. `POST /api/operations/[id]/lore-requests/[requestId]/vote` — 투표

### Phase 2 — OperationHub/생성 관리

7. `POST /api/operations` — 작전 생성 (Admin/일반 분기)
8. `PATCH /api/admin/operations/[id]/status` — 상태 변경

### Phase 3 — 전투 시스템 연동 (후순위, 가장 복잡)

9. `POST /api/operations/[id]/submit-action` — 행동 제출
10. `POST /api/operations/[id]/judge` — AI GM 판정 (AI API 연동)
11. Supabase Realtime (판정 결과, 스탯 변동)
12. 전투 종료 처리 (HP 0 감지 + 완료 상태 전환)

---

## 10. 환경변수

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...   # Storage signed URL 발급용

# Discord OAuth
DISCORD_CLIENT_ID=123456789012345678
DISCORD_CLIENT_SECRET=xxx
DISCORD_BOT_TOKEN=xxx   # DM 알림 발송용

# AI GM
GEMINI_API_KEY=AIzaSy...   # 또는 ANTHROPIC_API_KEY
```

---

## 11. 질문/협의 필요 항목

| 항목 | 현황 | 협의 필요 |
|------|------|---------|
| AI GM 구현체 | 미결정 | Gemini vs Claude, 프롬프트 설계 |
| 판정 타임아웃 | 스펙: 10분 미제출 시 auto-fail | 타임아웃 처리 주체 (서버 cron? Edge Function?) |
| 관전 모드 | 프론트 UI는 있음 | 관전 시 Realtime 채널 진입 권한 처리 |
| Operation 생성 UI | Admin만 생성 가능 | 어드민 패널 별도? 아니면 기존 CreateOperationModal 재사용? |
| 서사반영 AI 요약 | `lore_requests.ai_summary` 필드 | 언제, 어떤 AI로 생성하나? |
| 서사 선택 구간 저장 | `lore_request_segments` 도입(확정) | v1 메시지 전체 선택(오프셋 비사용), v1.1 부분 오프셋 선택 확장 |
| Rate Limiting | 스펙: 판정 분당 10회, 메시지 분당 30회 | Supabase Edge Function 레벨? Next.js 미들웨어 레벨? |
| NvN 스키마 | 정규화 구조로 확정 (`operation_turns` + `operation_turn_actions` + `operation_turn_judgments`) — 1v1/2v2/3v3/4v4 모두 동일 모델 | 세부 제약/인덱스(턴당 참가자 1행 보장 등) 구현 단계에서 확정 |

---

## 12. 프론트엔드 수정 필요 항목 (백엔드 연동 전)

백엔드 API 연동 시 아래 프론트엔드 파일 수정이 필요하다.

### 12.1 `room/types.ts` — NarrativeRequest 타입 (현재 미반영, 연동 시 수정 필요)

현재 `apps/dashboard/src/components/room/types.ts` 상태:

```typescript
export type NarrativeRequestStatus = "voting" | "approved" | "rejected";

export interface NarrativeRequest {
  id: string;
  requesterId: string;
  rangeStart: string;
  rangeEnd: string;
  status: NarrativeRequestStatus;
  votes: Record<string, "reflect" | "skip">;
  totalParticipants: number;
}
```

**백엔드 연동 시 수정 필요(목표 상태):**
```typescript
export interface NarrativeRequest {
  // ... 위 필드 유지 ...
  segments: Array<{
    messageId: string;
    startOffset: null; // v1: 항상 null
    endOffset: null;   // v1: 항상 null
    selectedText: string;
  }>;
}
```

> `segments`는 현재 `NarrativeVoteCard` UI에서 렌더링하지 않으므로, 먼저 타입/파싱만 맞추고
> 실제 표시 기능은 별도 UI 작업 시점에 확장한다.

### 12.2 `ActionInput` — `submit-action` 페이로드에서 `costHp`/`costWill` 제외 (이미 반영됨)

현재 `ActionInput.tsx`의 `onSubmit` 콜백 타입:

```typescript
onSubmit: (data: {
  actionType: ActionType;
  abilityId: string;
  targetId: string;
  narration: string;
}) => void;
```

`costHp`/`costWill`은 포함하지 않는다. 백엔드 연동 시 변경 불필요.

`BattleAbility` 타입에는 `costHp`/`costWill`이 여전히 존재하지만, 이는 클라이언트 내 코스트 미리보기 표시 전용이다. API 전송값과 별개로 유지한다.

> `GET /api/operations/[id]`에서 abilities를 반환할 때 `cost_hp`/`cost_will`(snake_case)을 `costHp`/`costWill`(camelCase)로 변환해 응답하면 된다.

---

## 13. 이번 세션 결정 사항 (2026-02-20)

아래 항목은 구현 중 해석 차이를 막기 위해 팀 합의로 확정한 내용이다.

### 13.1 Downtime 우선 구현

- 결정: 1차 구현은 전투(Operation)보다 **Downtime 채팅/서사반영**을 먼저 완료한다.
- 이유:
  - 사용자 체감 가치가 빠르게 나오고(메시지 송수신, 실시간 반영), 복잡한 전투 판정 로직 의존도가 없다.
  - 전투 시스템(턴/판정/밸런싱/AI)은 리스크가 크므로 후순위로 분리하는 편이 일정 안정성이 높다.

### 13.2 서사 반영 구간 저장 테이블 분리

- 결정: `lore_requests`(요청 메타)와 `lore_request_segments`(선택 구간)를 분리 저장한다.
- 이유:
  - `rangeStart/rangeEnd`만으로는 "메시지의 특정 부분"을 정확히 복원/감사하기 어렵다.
  - 선택 텍스트 snapshot을 남겨 승인 시점 근거를 보존해야 이후 변경/마스킹에도 추적 가능하다.

### 13.3 `lore_request_segments.operation_id` 추가

- 결정: `lore_request_segments`에 `operation_id`를 둔다.
- 이유:
  - 세그먼트가 다른 operation 메시지를 참조하는 데이터 오염을 빠르게 검증/차단할 수 있다.
  - 조인/필터링 시 operation 범위를 명시적으로 강제하기 쉽다.

### 13.4 Soft delete + Unique 정책 변경

- 결정: `UNIQUE(..., deleted_at)` 대신 `WHERE deleted_at IS NULL` partial unique index를 사용한다.
- 이유:
  - Postgres의 `NULL` 처리 특성상 `UNIQUE(..., deleted_at)`는 활성 행 중복을 완전히 막지 못한다.
  - partial unique index가 활성 데이터 중복 방지 목적에 정확히 부합한다.

### 13.5 서사 반영 v1 범위 축소 (메시지 전체 선택만)

- 결정: v1은 `segments[].messageId`만 받고, 부분 오프셋 선택은 v1.1로 미룬다.
- 이유:
  - 현재 UX 요구가 메시지 단위 선택 중심이며, 오프셋 검증/동기화 복잡도를 줄일 수 있다.
  - 빠른 릴리즈 후 실제 사용 패턴을 보고 부분 선택을 확장하는 편이 비용 대비 효율적이다.

### 13.6 lore-requests 생성 트랜잭션 강제

- 결정: `POST /api/operations/[id]/lore-requests`는 단일 DB 트랜잭션으로 처리한다.
- 이유:
  - 요청 메타만 생성되고 세그먼트가 누락되는 부분 저장(깨진 데이터)을 방지한다.
  - 실패 시 전체 롤백으로 재시도/운영 대응이 단순해진다.

### 13.7 `rangeStart/rangeEnd`는 하위호환 파생 필드로 유지

- 결정: `rangeStart/rangeEnd`를 제거하지 않고, `segments(order_index ASC)`의 첫/마지막 messageId로 계산한다.
- 이유:
  - 기존 프론트/표시 로직 호환성을 유지하면서도, 원본 데이터는 `segments`로 일원화할 수 있다.
  - 파생 규칙을 고정해 백엔드 구현자마다 값이 달라지는 문제를 방지한다.

### 13.8 무결성 검증은 서비스 + DB 이중 방어

- 결정: operation 일치 검증은 서비스 레이어와 DB 트리거를 모두 사용한다.
- 이유:
  - 서비스 레이어는 프론트 친화적 에러 코드를 제공하고,
  - DB 트리거는 직접 SQL/배치/신규 경로 등 우회 입력까지 최종 차단한다.

### 13.9 `lore_request_votes.operation_id` 컬럼 추가

- 결정: `lore_request_votes` 테이블에 `operation_id` 컬럼을 추가한다.
- 이유:
  - Supabase Realtime `postgres_changes` 구독은 테이블 수준 필터만 지원하며, 관계 조인 필터를 지원하지 않는다.
  - `lore_request_id`만으로는 해당 vote가 현재 operation 소속인지 Realtime 레벨에서 걸러낼 수 없다.
  - `operation_id=eq.{operationId}` 필터를 적용하려면 컬럼이 테이블에 직접 존재해야 한다.
  - `lore_requests.operation_id`와 일치 여부는 서비스 레이어 + DB 트리거로 이중 강제한다.

### 13.10 서사반영 거절 정책 — skip 즉시 rejected

- 결정: `lore_request_votes`에 `"skip"` 투표가 1건이라도 들어오면 나머지 미투표자 무관하게 즉시 `status = "rejected"`로 처리한다.
- 이유:
  - 반영 여부는 **만장일치**가 원칙이다. 한 명이라도 반대하면 서사 반영을 강행하지 않는다.
  - 전원 투표 완료를 기다릴 필요 없이 빠르게 결과를 확정하는 편이 UX에 유리하다.
  - `"approved"`는 전원 `"reflect"` 완료 후에만 확정된다 (비대칭 결정 로직).

---

*끝.*
