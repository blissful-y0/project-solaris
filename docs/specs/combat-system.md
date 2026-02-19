# Combat System — 전투 시스템 통합 스펙

> 전투 세계관 규칙 + AI GM 아키텍처 + MVP 판정 공식 + 데이터 계약을 한 문서에서 관리한다.
> 화면 UI/허브/다운타임은 [`operation.md`](./operation.md) 참조.

---

## 1. 설계 철학

### 권력 분립 원칙

전투 경합에서 가장 위험한 설계는 하나의 주체가 판정과 연산을 모두 수행하는 것이다.

- **LLM (사법부):** 서사적 맥락 이해 + 질적 판정 (grade, multiplier). 산술 연산 금지.
- **Edge Function (행정부):** 트랜잭션 단위 원자적 연산. 판정 해석/변경 금지.
- **Narration LLM (언론부):** 확정 수치 기반 서사 생성. 수치 왜곡 금지.

```
User A 서술 ──┐
              ├─→ [Phase 1: Input 수집]
User B 서술 ──┘          |
                         v
              [Phase 2: LLM 판정]        ← grade + multiplier만 출력
                         |
                    JSON 판정문
                         |
                         v
              [Phase 3: Edge Function]   ← 기계적 수치 연산
                         |
                   확정 수치 변동
                         |
                         v
              [Phase 4: LLM 묘사]        ← 수치 종속 서사
                         |
                         v
              유저에게 결과 전달
```

### 서술 우선 판정

- 다이스 없음. 행동 서술의 합리성/전술/대가 반영으로 결정.
- 능력 강함 = 자동 승리 금지. 반동과 상황 제약 필수.
- 절대 무적 금지. 모든 능력에는 대가와 한계가 있다.

---

## 2. 세계관 전투 규칙

### 스탯

- **HP:** 물리적 상태. 회복 가능 (전투 간 휴식/치료/씬 전환).
- **WILL:** 정신적 한계치. **영구 비회복.** 시즌 내내 감소만.

### 진영별 초기값

| 진영 | HP | WILL |
|---|---|---|
| 보안국 (동조형, 공명율 80+) | 80 | 250 |
| 스태틱 (비동조형, 공명율 15 미만) | 120 | 150 |
| 비능력자 (공명율 15~79) | 100 | 100 |
| 전향자 (보안국 -> 스태틱) | 100 | 200 |

### 전투 스타일

#### 동조형 (Synchronized)
- 안정적이고 정밀. 출력 조절 자유, 지속 시간 김.
- 헬리오스 연산 지원으로 최적 타이밍/궤도를 직감.
- **대가:** 능력 사용할수록 헬리오스와 동조 심화 → 자아 경계 희미. 감정 표현이 기계적으로 변함.
- **전투 스타일:** 군사적, 체계적. 팀 단위 연계 + 전술 판단 빠름.

#### 비동조형 (Asynchronized)
- 거칠고 폭발적. 순간 출력은 동조형 압도, 정밀 제어 어려움.
- 감정 상태에 출력 직결 (분노→폭주, 공포→소멸).
- **대가:** 명확한 육체 반동. 코피, 근육 경련, 의식 혼탁. 과사용 시 수명 단축.
- **전투 스타일:** 게릴라, 즉흥. 개인 화력 의존, 단기 결전 선호. 장기전 불리.

#### 전향자
- 원래 동조형이었으나 헬리오스에서 이탈.
- 도시 안: 동조형 능력 유지하나 연산 지원 끊김 → 정밀도/지속력 하락.
- **위험:** 능력 패턴이 보안국 DB에 등록 → 도시 안 사용 시 즉시 감지.
- 도시 밖: 동조형 안정성 + 비동조형 폭발력 중간.

### 능력 유형

- **하모닉스 프로토콜 (Harmonics Protocol):** 보안국 전용. WILL 소모.
- **오버드라이브 (Overdrive):** 스태틱 전용. HP 소모.

### 능력 계열 (4개)

1. **역장 (Field):** 공간/물리 법칙 간섭
2. **감응 (Empathy):** 타인의 정신/감각 간섭
3. **변환 (Shift):** 신체/물질 성질 변환
4. **연산 (Compute):** 정보 처리/예측. 보안국 특화. 스태틱 사용 시 HP+WILL 이중 코스트.

### 코스트 가이드라인

| 등급 | 하모닉스 (WILL) | 오버드라이브 (HP) |
|---|---|---|
| 기본기 | 3~5 | 15~20 |
| 중급기 | 8~15 | 30~40 |
| 상급기 | 20~30 | 50~60 |

- 코스트는 tier 고정표가 아닌 **캐릭터별 능력 레코드**에서 직접 참조 (`ability.cost_hp`, `ability.cost_will`).

### 연산(Compute) 특수 규칙

비동조형 사용 시 HP 코스트에 추가 WILL 소모:
- 기본기 +2, 중급기 +5, 상급기 +10

### 동조율 연동

- 능력 1회 사용: 동조율 -2~5 (강도에 따라)
- 과사용 (1씬에 3회 이상): 헬리오스 감지 위험 증가
- 동조율 70 이하: 능력 불안정, 추방 대상 경고
- 회복: 휴식 1씬당 +3, 공명판 사용 시 +10

### 비능력자 전투원

- HP 100 / WILL 100. WILL은 정신 공격 방어막으로만 기능.
- **고유 메리트 5개:**
  1. 헬리오스 투명 (Invisible to Helios)
  2. 장비 특화 (Hardware Specialist)
  3. 냉정한 판단 (Cold Reading)
  4. 침투 전문가 (Infiltrator)
  5. 정신 내성 (Null Mind)

### 환경/시스템 이벤트

- **공명판 교란:** 파손 시 감정 폭풍(Emotional Storm) → 양측 운용 안정성 흔들림.
- **꿈 트리거:** 비동조형 극한 상태에서 비전(Vision) 형태 단서 발생 가능.
- **자아 잠식:** 동조형 WILL 저점 구간에서 시스템 개입 리스크 증가.

### 부상/회복 시스템

| 등급 | 지속 | 효과 | 회복 |
|------|------|------|------|
| 경상 (Minor) | 다음 씬까지 | 관련 행동 -10% | 자연 치유 또는 기본 치료 |
| 중상 (Major) | 시즌 내 영구 (3~4주) | 전투력 -30%, 일부 행동 불가 | 전문 치료 + 휴식 (최소 1주) |
| 치명상 (Critical) | 캐릭터 사망/퇴장 | 플레이어 새 캐릭터 생성 가능 | AI GM 생존 판정 (스토리 중요 순간) |

### GM 바이어스 (Helios Bias)

AI GM은 헬리오스 산하이므로 보안국에 미묘하게 유리한 판정.

| 시즌 시점 | 편향 |
|-----------|------|
| 초반 | +5% (거의 눈치 못 챔) |
| 중반 | +15% (명확하게 인식 가능) |
| 후반 | 노골적 편향 (판정 왜곡, 정보 누락) |

관리자 패널에서 슬라이더로 조절.

### 사망

**플레이어 동의 시에만.** HP 0 = 전투불능, 사망 아님.

---

## 3. 전투 파이프라인 (4-Phase)

### Phase 1: Input (서술 수집)

양측 유저로부터 행동 선언을 수집한다. 이 단계에서 판정은 수행하지 않는다.

**Input 단계 선검증:**
- `ability_id`로 능력 데이터 조회
- `current_hp >= ability.cost_hp` 및 `current_will >= ability.cost_will` 검사
- 부족하면 즉시 제출 거부 (Judgement 단계로 넘기지 않음)

### Phase 2: Judgement (LLM 판정)

양측 서술, 스탯, 특성, 맥락을 종합해 질적 판정을 내린다.

**LLM 프롬프트 핵심 지침:**
1. 양측 서술을 서사적 맥락에서 평가
2. 각 행동의 성공 등급 판정
3. 데미지 계수(multiplier) 산출. **HP를 직접 계산하지 마라.**
4. 판정 근거 반드시 명시

**판정 출력 JSON 스키마:**

```json
{
  "encounter_id": "string",
  "phase": "judgement",
  "judgement": {
    "narrative_summary": "string",
    "actions": [
      {
        "actor": "participant_id",
        "action": "행동 설명",
        "grade": "Success | Partial | Fail",
        "multiplier": 0.0~1.0,
        "reasoning": "판정 근거",
        "stat_targets": [
          {
            "target": "participant_id",
            "stat": "HP | WILL",
            "base_damage": 20
          }
        ]
      }
    ]
  }
}
```

**AI GM 평가 기준:**

| 항목 | 가중치 |
|------|--------|
| 서술 합리성 | 30% |
| 전술적 판단 | 25% |
| 대가 반영 | 20% |
| 누적 피로 | 15% |
| 서술 품질 | 10% |

### Phase 3: Execution (Edge Function 연산)

Phase 2의 판정 JSON을 입력받아 트랜잭션 단위로 스탯 업데이트.

**연산 공식:**

```
final_damage = floor(base_damage * multiplier)
new_value = max(0, current - final_damage)
```

**적용 규칙:**
1. 코스트 선차감 (성공/실패 무관)
2. 스탯 0 미만 불가 (clamp to 0)
3. HP 0 → 무력화 플래그
4. WILL 0 → 의지 상실 플래그
5. **단일 트랜잭션** — 부분 적용 절대 금지, 실패 시 전체 롤백

**적용 순서 불변식:**
1. 유효성 검증
2. 코스트 선차감
3. 판정 multiplier 반영
4. 데미지/감쇠/지원 보정 적용
5. 최종 stat 반영

### Phase 4: Narration (결과 서사)

확정 수치를 기반으로 인과관계가 명확한 서사 생성.

**제약:**
- Phase 3 확정 수치를 정확히 반영
- 판정 등급에 따라 묘사 강도 조절
- 패배 측에도 서사적 존엄 부여 (일방적 조롱 금지)
- 서사가 수치를 만드는 것이 아니라, **수치가 서사를 제약한다**

### 설계 불변식 (Invariants)

1. LLM은 절대 사칙연산을 수행하지 않는다. `base_damage`와 `multiplier`만 출력.
2. Edge Function은 절대 판정 등급을 해석/변경하지 않는다.
3. 모든 스탯 변경은 단일 트랜잭션. 부분 적용 = 시스템 버그.
4. Narration은 확정 수치에 종속. 서사적 편의를 위한 수치 왜곡 금지.
5. HP/WILL 0 도달 시 플래그 즉시 설정, Phase 4에서 반드시 반영.

---

## 4. MVP 판정 규칙 (초기 버전)

### 판정 3단계 (Critical 제외)

MVP에서는 Critical Success / Critical Failure를 제외하고 3단계만 사용한다.

| Grade | Multiplier | 의미 |
|---|---:|---|
| Success | 1.0 | 의도 대부분 달성 |
| Partial | 0.5 | 부분 달성 |
| Fail | 0.0 | 효과 없음 |

> Critical/Critical Failure는 시즌 진행 후 추가 예정.

### base_damage 테이블

| action_type | target_stat | base_damage (기본기) |
|---|---|---:|
| attack | HP | 20 |
| disrupt | WILL | 15 |
| defend | - | 0 |
| support | - | 0 |

### 능력 등급별 damage_factor

| ability_tier | damage_factor |
|---|---:|
| basic | 1.0 |
| mid | 1.5 |
| advanced | 2.2 |

**최종 계산:**
```
base_damage_final = floor(base_damage(action_type) * damage_factor(ability_tier))
final_damage = floor(base_damage_final * multiplier)
```

### defend / support 규칙

- **defend:** 지정 아군이 이번 턴 받는 첫 피해에 `damage_factor = 0.5`
- **support:** 지정 아군의 이번 턴 첫 공격에 `multiplier +0.25` (상한 1.0)
- 두 효과 모두 1턴 1회성 토큰 (중첩 없음)

### 코스트 선차감

- 행동이 유효하게 제출되면 **판정 결과와 무관하게** 코스트 즉시 차감.
- 시스템 거부(권한/코스트 부족) 시에만 미차감.

### Lock 메커니즘

- A/B가 서로의 선언을 확인하면 턴을 `locked` 상태로 고정.
- `locked` 이전: 선언 수정 허용.
- `locked` 이후: 수정 불가.
- 제한 시간(10분) 내 미제출 → 자동 Fail 처리.

### 타임아웃

- 10분. 미제출 시 자동 패스 (auto-fail).

---

## 5. 2:2 확장 규칙

### 기본 원칙

- 1:1 심플 규칙을 유지. 참가자 수와 타겟 규칙만 확장.
- 계산식 (`base_damage * multiplier`) 그대로 사용.

### 참가자 모델

- 팀당 최대 2명 (초기 2:2)
- 각 참가자는 독립 행동 선언 1개
- 미제출자는 해당 턴 Fail 처리

### 타겟 규칙

- **attack:** 단일 타겟
- **disrupt:** 단일 또는 다중 타겟
- **defend/support:** 아군 1인 (초기)

### Focus Fire 감쇠

같은 턴에 2인이 동일 적 1인을 타격할 때:
- 첫 번째 타격: 100%
- 두 번째 타격: 80%

```
final_damage = floor(base_damage * multiplier * focus_factor)
```

### 비동시 협의 흐름

팀 A 선언 → 팀 B 선언 → 양팀 lock → 연산/반영

- 한 턴의 모든 stat change를 단일 트랜잭션으로 반영
- 중간 실패 시 전체 롤백

### 승리 조건

- **섬멸형 (기본):** 한 팀 전원 HP 0 → 패배
- **목표형 (확장 예정):** 지정 목표 달성 시 승리 (플래그로 비활성 유지)

### 다인 전투 (3명+, 향후)

- 턴 순서: 전술 판단력 높은 순 → 동조율 순
- 협동 보너스: 2명 +10%, 3명 이상 +20% (서술에 협력 방식 명시 필수)
- 전장 환경: AI GM이 지형/날씨/시간대 효과 부여
- NPC 지원: 양측 AI GM 운영 NPC 요청 가능

---

## 6. 데이터 계약 (TypeScript)

### BattleSessionData (세션 초기 로드)

```typescript
{
  id: string;
  title: string;
  currentTurn: number;
  phase: TurnPhase;
  participants: BattleParticipant[];
  messages: ChatMessage[];
  myParticipantId: string;
}
```

### TurnPhase 흐름

```
my_turn → (제출) → waiting → (상대 제출) → both_submitted → (판정) → judging → (완료) → my_turn
```

### BattleParticipant

```typescript
{
  id: string;
  name: string;
  faction: "bureau" | "static" | "defector";
  team: "ally" | "enemy";          // 서버에서 현재 유저 기준 계산
  hp: { current: number; max: number };
  will: { current: number; max: number };
  abilities: BattleAbility[];
}
```

### BattleAbility

```typescript
{
  id: string;
  name: string;
  tier: "basic" | "mid" | "advanced";
  costHp: number;
  costWill: number;
}
```

### SubmitAction (행동 제출)

```typescript
{
  actionType: "attack" | "disrupt" | "defend" | "support";
  abilityId: string;
  targetId: string;
  narration: string;      // 유저 서술 텍스트
}
```

### ChatMessage

```typescript
{
  id: string;
  type: "narration" | "judgment" | "system" | "gm_narration";
  senderId?: string;
  senderName?: string;
  content: string;
  timestamp: string;
  isMine?: boolean;                // 서버에서 계산
  judgment?: JudgmentResult;       // type=judgment
  action?: {                       // type=narration
    actionType: ActionType;
    abilityName: string;
    targetName: string;
  };
}
```

메시지 타입:
- `narration`: 유저 서술 (행동 정보 포함)
- `judgment`: HELIOS GM 판정 결과 카드
- `system`: 턴 전환 알림 ("TURN 3")
- `gm_narration`: GM 상황 묘사 (판정 후 서사)

### JudgmentResult (판정 결과)

```typescript
{
  turn: number;
  participantResults: [
    {
      participantId: string;
      participantName: string;
      grade: "success" | "partial" | "fail";
      scores: {
        narrative: number;   // 서술 합리성 /10
        tactical: number;    // 전술 /10
        cost: number;        // 대가 반영 /10
        quality: number;     // 서술 품질 /10
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

### Realtime 이벤트

#### 전투 (Operation)

| 이벤트 | 트리거 | 페이로드 |
|--------|--------|----------|
| `phase_change` | 페이즈 전환 | `{ phase, currentTurn }` |
| `new_message` | 서술/판정/시스템 메시지 | `ChatMessage` |
| `stat_update` | 판정 후 스탯 변동 | `{ participantId, hp, will }` |

#### 다운타임 (Downtime)

| 이벤트 | 트리거 | 페이로드 |
|--------|--------|----------|
| `new_message` | 참가자 서술 | `RoomMessage` |
| `narrative_vote` | 투표 업데이트 | `{ messageId, votes, status }` |

### 서사 반영 투표 (NarrativeRequest)

```typescript
{
  requesterId: string;
  rangeStart: string;       // 반영 대상 메시지 범위 시작 ID
  rangeEnd: string;
  votes: Record<string, "reflect" | "skip" | "pending">;
  totalParticipants: number;
  status: "voting" | "approved" | "rejected";
}
```

---

## 7. API 갭 요약 (구 API vs 프론트엔드 요구)

| 항목 | 구 API-SPEC | 프론트엔드 요구 | 갭 |
|------|------------|----------------|-----|
| 턴 페이즈 | `current_turn` (character_id) | `phase` (상태 enum) | 서버 계산 또는 Realtime |
| 행동 유형 | 없음 | `actionType` (4종) | 필드 추가 |
| 대상 지정 | 없음 | `targetId` | 필드 추가 |
| 판정 구조 | `{ result, damage, commentary }` | 4항목 채점 + 양측 결과 + 스탯 변동 | 대폭 확장 |
| GM 서사 | 없음 | `gm_narration` 메시지 타입 | AI 생성 서사 추가 |
| 팀 구분 | `initiator`/`opponent` | `team: "ally" \| "enemy"` | 서버 계산 |
| 서사 반영 | 없음 | 투표 시스템 | 완전 신규 |
| 통합 목록 | battles + rooms 분리 | `OperationItem[]` 통합 | 통합 API |
| Realtime | 미정의 | phase/message/stat 이벤트 | 전면 설계 필요 |
