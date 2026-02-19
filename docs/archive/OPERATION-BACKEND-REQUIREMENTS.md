# Operation 프론트엔드 → 백엔드 요구사항

> 프론트엔드(`feat/operation-front`)가 소비하는 데이터 구조 기준.
> 기존 `API-SPEC.md`의 Battles/Rooms API와 **차이점** 위주로 정리.

---

## 1. 전투 세션 (Battle Session)

### 1-1. 세션 초기 로드

**프론트엔드가 필요로 하는 데이터** (`BattleSessionData`):

```typescript
{
  id: string;              // 전투 ID
  title: string;           // 작전 제목
  currentTurn: number;     // 현재 턴 번호
  phase: TurnPhase;        // "my_turn" | "waiting" | "both_submitted" | "judging"
  participants: BattleParticipant[];
  messages: ChatMessage[];
  myParticipantId: string; // 현재 유저의 참가자 ID
}
```

**API-SPEC과의 차이:**
- API-SPEC의 `current_turn`은 character_id(누구 턴인지) → 프론트는 `phase`로 변환 필요
- API-SPEC에 `phase` 개념 없음 → 서버에서 계산하거나 Realtime으로 전달
- `messages`는 API-SPEC의 `turns[]` 배열을 채팅 형태로 변환한 것

### 1-2. 참가자 (BattleParticipant)

```typescript
{
  id: string;
  name: string;
  faction: "bureau" | "static" | "defector";
  team: "ally" | "enemy";           // API-SPEC에 없음 — 서버에서 계산
  hp: { current: number; max: number };
  will: { current: number; max: number };
  abilities: BattleAbility[];
}
```

**백엔드 필요:**
- `team` 필드: 현재 유저 기준 아군/적군 구분 (서버에서 계산)
- `hp`/`will` 현재값: API-SPEC의 `battle_state`에서 추적
- `abilities`: 캐릭터의 전투용 능력 목록 (tier, costHp, costWill 포함)

### 1-3. 능력 (BattleAbility)

```typescript
{
  id: string;
  name: string;
  tier: "basic" | "mid" | "advanced";
  costHp: number;    // HP 소모량 (Static 계열)
  costWill: number;  // WILL 소모량 (Bureau 계열)
}
```

**API-SPEC과의 차이:**
- API-SPEC의 `abilities_used: string[]` (ID 배열만) → 프론트는 능력 상세 정보 필요
- DB의 `cost_hp`/`cost_will` 분리 구조 반영 완료

### 1-4. 행동 제출 (Submit Action)

**프론트엔드가 보내는 데이터:**

```typescript
{
  actionType: "attack" | "disrupt" | "defend" | "support";
  abilityId: string;
  targetId: string;      // 대상 참가자 ID
  narration: string;     // 유저 서술 텍스트
}
```

**API-SPEC과의 차이:**
- API-SPEC: `{ narrative, abilities_used[] }` — actionType, targetId 없음
- 프론트엔드는 행동 유형(4종)과 대상 지정이 필요
- **백엔드 추가 필요**: `action_type`, `target_id` 필드

### 1-5. 턴 페이즈 흐름

```
my_turn → (제출) → waiting → (상대도 제출) → both_submitted → (판정 시작) → judging → (완료) → my_turn/waiting
```

**Realtime 이벤트 필요:**

| 이벤트 | 트리거 | 페이로드 |
|--------|--------|----------|
| `phase_change` | 페이즈 전환 시 | `{ phase, currentTurn }` |
| `new_message` | 상대 서술 제출 / GM 판정 완료 / 시스템 메시지 | `ChatMessage` |
| `stat_update` | 판정 후 HP/WILL 변동 | `{ participantId, hp, will }` |

### 1-6. 채팅 메시지 (ChatMessage)

```typescript
{
  id: string;
  type: "narration" | "judgment" | "system" | "gm_narration";
  senderId?: string;
  senderName?: string;
  content: string;
  timestamp: string;
  isMine?: boolean;       // 서버에서 계산
  judgment?: JudgmentResult;  // type=judgment일 때
  action?: {                  // type=narration일 때
    actionType: ActionType;
    abilityName: string;
    targetName: string;
  };
}
```

**메시지 타입별 설명:**
- `narration`: 유저 서술 (행동 정보 포함)
- `judgment`: HELIOS GM 판정 결과 카드
- `system`: 턴 전환 알림 ("TURN 3")
- `gm_narration`: GM이 생성한 상황 묘사 (판정 후 서사)

### 1-7. GM 판정 결과 (JudgmentResult)

```typescript
{
  turn: number;
  participantResults: [
    {
      participantId: string;
      participantName: string;
      grade: "success" | "partial" | "fail";
      scores: {
        narrative: number;  // 서술 합리성 /10
        tactical: number;   // 전술 /10
        cost: number;       // 대가 반영 /10
        quality: number;    // 서술 품질 /10
      };
    }
  ];
  statChanges: [
    {
      participantId: string;
      participantName: string;
      stat: "hp" | "will";
      before: number;
      after: number;
      reason: string;       // "코스트" | "피해" | "방어 경감" | "반동"
    }
  ];
}
```

**API-SPEC과의 차이:**
- API-SPEC: `{ result, damage, commentary }` — 단순 판정
- 프론트엔드: 4항목 채점 + 양측 개별 결과 + 스탯 변동 상세 추적
- **백엔드 대폭 확장 필요**: AI 판정 결과 구조 변경

---

## 2. RP 방 (Downtime Room)

### 2-1. 방 초기 로드

**프론트엔드가 필요로 하는 데이터:**

```typescript
{
  roomTitle: string;
  participants: RoomParticipant[];  // { id, name }
  initialMessages: RoomMessage[];
  currentUserId: string;
}
```

### 2-2. 메시지 (RoomMessage)

```typescript
{
  id: string;
  type: "narration" | "system" | "narrative_request";
  sender?: RoomParticipant;
  content: string;
  timestamp: string;
  isMine?: boolean;
  narrativeRequest?: NarrativeRequest;  // type=narrative_request일 때
}
```

### 2-3. 서사 반영 투표 (NarrativeRequest)

```typescript
{
  requesterId: string;
  rangeStart: string;   // 반영 대상 메시지 범위 시작 ID
  rangeEnd: string;     // 반영 대상 메시지 범위 끝 ID
  votes: Record<string, "reflect" | "skip" | "pending">;
  totalParticipants: number;
  status: "voting" | "approved" | "rejected";
}
```

**API-SPEC에 없음** — 완전 신규:
- 서사 반영 요청/투표 시스템
- 참가자 전원 동의 시 HELIOS에게 서사 반영 요청

**Realtime 이벤트 필요:**

| 이벤트 | 트리거 | 페이로드 |
|--------|--------|----------|
| `new_message` | 참가자 서술 전송 | `RoomMessage` |
| `narrative_vote` | 투표 업데이트 | `{ messageId, votes, status }` |
| `battle_convert` | 전투 전환 시 | `{ battleId }` — 전투 세션으로 리다이렉트 |

---

## 3. 작전 목록 (Operation List)

### 3-1. 목록 아이템 (OperationItem)

```typescript
{
  id: string;
  title: string;
  type: "operation" | "downtime";
  status: "waiting" | "live" | "completed";
  teamA: TeamMember[];      // 아군 (OPERATION)
  teamB: TeamMember[];      // 적군 (OPERATION)
  host: TeamMember;         // 호스트 (DOWNTIME)
  summary: string;
  maxParticipants: number;
  createdAt: string;
  isMainStory?: boolean;    // 운영자 메인 스토리 이벤트
}
```

**API-SPEC과의 차이:**
- API-SPEC: battles와 rooms가 분리된 엔드포인트
- 프론트엔드: 통합 목록 (`type`으로 구분)
- **백엔드 필요**: 통합 목록 API 또는 프론트에서 merge

---

## 4. API-SPEC 대비 갭 요약

| 항목 | API-SPEC 현재 | 프론트엔드 요구 | 갭 |
|------|--------------|----------------|-----|
| 턴 페이즈 | `current_turn` (character_id) | `phase` (상태 enum) | 서버 계산 또는 Realtime |
| 행동 유형 | 없음 | `actionType` (4종) | 필드 추가 |
| 대상 지정 | 없음 | `targetId` | 필드 추가 |
| 판정 구조 | `{ result, damage, commentary }` | 4항목 채점 + 양측 결과 + 스탯 변동 | 대폭 확장 |
| GM 서사 | 없음 | `gm_narration` 메시지 타입 | AI 생성 서사 추가 |
| 팀 구분 | `initiator`/`opponent` | `team: "ally" \| "enemy"` | 서버 계산 |
| 서사 반영 | 없음 | 투표 시스템 | 완전 신규 |
| 통합 목록 | battles + rooms 분리 | `OperationItem[]` 통합 | 통합 API 또는 프론트 merge |
| Realtime | 미정의 | phase/message/stat 이벤트 | 전면 설계 필요 |
