# AI GM 시스템 설계
AI GM은 단순 판정기가 아니라 세계 상태, 서사 조각, 시즌 규칙을 결합해 일관된 캐논을 유지하는 운영 코어다.

## 핵심 목표
### 문제 정의
#### 운영 난제
- 장기 러닝에서 컨텍스트 윈도우 한계를 넘어서는 기억 유지
- 동시다발 전투/RP 간 서사 정합성 보존
- 유저 생성 서사의 공식 편입 절차 표준화
- 환각(Hallucination) 최소화와 유지보수 자동화

## 데이터 모델
### lore_fragments — 서사 조각 저장소
사실/소문/사건/캐릭터 아크 단위로 서사를 분해 저장한다.

```sql
CREATE TABLE lore_fragments (
  id TEXT PRIMARY KEY DEFAULT nanoid(12),
  type TEXT NOT NULL CHECK (type IN ('fact', 'rumor', 'event', 'character_arc')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'canon', 'rejected', 'retconned')),
  source_type TEXT NOT NULL
    CHECK (source_type IN ('battle', 'rp_room', 'admin', 'ai_generated')),
  source_id TEXT,
  content TEXT NOT NULL,
  raw_message_ids JSONB,
  participant_ids TEXT[],
  tags TEXT[],
  importance INT DEFAULT 5 CHECK (importance BETWEEN 1 AND 10),
  embedding VECTOR(1536),
  season INT NOT NULL DEFAULT 1,
  in_world_date TEXT,
  approved_at TIMESTAMPTZ,
  approved_by TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_lore_status ON lore_fragments(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_lore_participants ON lore_fragments USING GIN(participant_ids);
CREATE INDEX idx_lore_tags ON lore_fragments USING GIN(tags);
CREATE INDEX idx_lore_embedding ON lore_fragments USING ivfflat(embedding vector_cosine_ops);
```

### world_state — 세계 스냅샷
시즌별 편향도, 진영 파워, 활성 플롯 스레드, 최근 사건 요약을 저장한다. AI GM 컨텍스트 구성 시 우선 로딩되는 기준 상태다.

```sql
CREATE TABLE world_state (
  id SERIAL PRIMARY KEY,
  season INT NOT NULL,
  helios_bias FLOAT DEFAULT 0.05 CHECK (helios_bias BETWEEN 0.0 AND 1.0),
  total_will_consumed BIGINT DEFAULT 0,
  avg_resonance_rate FLOAT DEFAULT 0.85,
  faction_power JSONB DEFAULT '{"bureau": 0.6, "static": 0.3, "neutral": 0.1}',
  active_plot_threads JSONB[],
  recent_events_summary TEXT,
  snapshot_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 서사 정식화 파이프라인
유저가 "이 RP를 공식 서사로 포함해달라"고 요청했을 때의 처리 흐름.

### 처리 단계
1. **RP 진행**: room_messages 테이블에 실시간 저장. 원본 데이터 영구 보관.
2. **유저 요청**: "이 구간 서사 반영해줘" → lore_requests 생성. UI: 메시지 롱프레스 → 범위 선택 → "서사 반영 요청" 버튼.
3. **참가자 투표**: 해당 RP 참가자 전원 동의 필요. 48시간 내 미응답 시 자동 거절.
4. **AI 요약**: Gemini Flash로 500자 이내 서사 텍스트 생성. OpenAI Embedding API로 벡터 생성. 태그 자동 추출 (장소, 감정, 사건 유형).
5. **자동/수동 승인**: importance ≤ 5는 자동 승인 (일상적 상호작용). importance > 5는 Admin 검토 큐에 추가 (전투 결과, 진영 관계 변화, 주요 인물 사망 등).
6. **정식화 완료**: lore_fragments INSERT (status: canon) → character_lore에 참가자별 연결 → world_state 업데이트 → Discord 알림: "새로운 서사가 기록되었습니다"

## 컨텍스트 최적화
### 계층적 요약 (Hierarchical Summarization)
모든 히스토리를 컨텍스트에 넣을 수 없으므로, 시간 범위에 따라 요약 레벨을 다르게 적용한다.

- Level 0 (원본): 최근 5턴 → 원문 그대로 포함
- Level 1 (턴 요약): 6~20턴 → 턴별 1-2문장 요약
- Level 2 (세션 요약): 이전 세션 → 전체 요약본만 포함
- Level 3 (시즌 요약): 이전 시즌 → 핵심 사건만 bullet point

### RAG (Retrieval-Augmented Generation)
현재 전투/RP 상황과 관련된 과거 서사를 벡터 검색으로 찾아 컨텍스트에 삽입한다.

1. 현재 서술에서 키워드/엔티티 추출 (캐릭터명, 장소, 능력명)
2. lore_fragments에서 벡터 유사도 검색 (pgvector cosine similarity)
3. 상위 K개 선택 (importance 가중치 적용, K=5~10)
4. 컨텍스트에 "관련 서사" 섹션으로 삽입

### 토큰 예산 관리
총 컨텍스트 예산: ~8,000 tokens (Gemini Flash 1.5 기준)

| 슬롯 | 토큰 |
|---|---|
| 시스템 프롬프트 (GM 인격/규칙) | ~1,500 |
| 세계 상태 요약 | ~500 |
| 참가 캐릭터 정보 (x2) | ~1,000 |
| 관련 Lore (RAG 결과) | ~1,500 |
| 최근 턴 히스토리 | ~2,500 |
| 현재 턴 입력 | ~500 |
| 출력 여유 | ~500 |

초과 시 전략:
1. 오래된 턴 요약 압축
2. RAG 결과 개수 축소
3. 캐릭터 정보 필수 필드만

## 환각 방지
### Grounding Rules (시스템 프롬프트 필수 준수)
1. 오직 제공된 컨텍스트 내의 정보만 사용하라.
2. 새로운 NPC, 장소, 사건을 임의로 생성하지 마라.
3. 캐릭터의 과거사를 추가하지 마라 (캐릭터 시트에 없는 내용).
4. 불확실한 정보는 "~로 알려져 있다", "~라는 소문이 있다"로 처리하라.
5. 세계관 핵심 설정(헬리오스의 정체, 꿈의 박탈)은 시즌 진행에 따라서만 노출하라.
6. 캐릭터 사망은 절대 일방적으로 선언하지 마라 (플레이어 동의 필수).
7. 스탯 변동은 반드시 SYSTEM RULEBOOK의 공식에 따라 계산하라.

### Post-Generation Validation
AI GM 출력 후 자동 검증 파이프라인:

1. **엔티티 추출**: 출력문에서 언급된 캐릭터/장소/아이템 추출
2. **존재 검증**: DB에 해당 엔티티가 존재하는지 확인
3. **불일치 처리**:
   - 경미 (오타 수준): 자동 수정
   - 중간 (미등록 NPC 언급): 일반화 ("한 시민이" → "누군가가")
   - 심각 (세계관 위배): 재생성 요청 (최대 2회)
4. **폴백**: 반복 실패 시 템플릿 응답 + Admin 알림

## 유지보수 전략
### 데이터 아카이빙
- 시즌 종료 시: room_messages 원본을 Supabase Storage (cold)로 이동
- lore_fragments: 영구 보관 (RAG 검색 가능 상태 유지)
- 3시즌 이상 경과: Level 3 요약본만 hot storage에 유지, 나머지 cold

### 서사 정합성 검사 (Weekly Cron)
주간 배치 작업으로 다음을 자동 탐지한다:
- 동일 인물의 상충되는 행동/발언
- 시간선 불일치 (A 이벤트가 B보다 먼저인데 B를 전제로 함)
- 사망 캐릭터가 이후 서사에 등장

발견 시: Admin 알림 (Discord + 대시보드 배너) → 검토 큐에 추가 → 필요 시 retcon 처리 (status: retconned)

### 버전 관리 및 Retcon
- 중요 설정 변경 시 world_state 스냅샷 자동 생성
- Retcon 발생 시 영향받는 lore_fragments에 retcon_reason 기록
- Retcon된 서사는 RAG 검색에서 제외 (status 필터)

### Edge Function 목록

| Function | Trigger | 역할 |
|---|---|---|
| summarize-turn | battle_turns INSERT | 턴 요약 생성 (Level 1) |
| summarize-lore | lore_requests 전원동의 | RP 요약 + 임베딩 생성 |
| refresh-gm-context | battle/room 진입 | RAG 검색 + 캐시 갱신 |
| validate-gm-output | GM 출력 후 | Hallucination 검사 |
| archive-season | 시즌 종료 (Admin) | 데이터 아카이빙 |
| consistency-check | 주간 Cron | 서사 정합성 검사 |
| generate-embedding | lore_fragments INSERT | 벡터 임베딩 생성 |

> [!TIP]
> 이 아키텍처는 Phase 2에서 구현 예정. Phase 1에서는 기본 전투/RP 시스템에 집중하고, lore_fragments와 RAG는 서비스 안정화 후 순차적으로 도입한다.

> [!NOTE]
> AI GM 출력은 "그럴듯함"보다 "근거 추적 가능성"을 우선해야 한다. 모든 핵심 판정 문장은 lore_fragments 또는 world_state의 근거로 역추적 가능해야 한다.
