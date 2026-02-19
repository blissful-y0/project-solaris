# Admin — 관리자 패널

> 캐릭터 승인, 밸런스 관리, 뉴스 관리, 시즌 대시보드, AI 모델 라우팅.

---

## 화면 (프론트엔드)

### 관리자 패널 (`/admin`)

관리자 전용. 일반 유저 접근 불가.

- **캐릭터 승인 큐:**
  - 캐릭터 시트 전체 보기 + 승인/반려(사유 입력) 버튼
  - 반려 시 사유가 Discord DM으로 전송 + 수정 페이지 딥링크
- **밸런스 관리:**
  - 특정 캐릭터 능력 코스트 조정 요청
  - 전체 능력 계열별 코스트 가이드라인 수정
- **GM 바이어스 슬라이더:**
  - 시즌 진행도에 따라 보안국 편향 % 조절
- **뉴스 관리:**
  - 자동 생성 뉴스 미리보기 + 수정/발행/삭제
  - 수동 뉴스 작성
- **시즌 대시보드:**
  - 활성 유저 수, 진행 중 전투 수, 평균 WILL 잔량
  - 시즌 시작/종료 트리거

---

## API (백엔드)

### GET /api/admin/characters/pending
승인 대기 중인 캐릭터 목록

### POST /api/admin/characters/:id/approve
캐릭터 승인

### POST /api/admin/characters/:id/reject
캐릭터 반려 (사유 필수)

---

### GET /api/admin/news
뉴스 관리 (전체, draft 포함)

### POST /api/admin/news
뉴스 수동 생성

### PATCH /api/admin/news/:id
뉴스 수정

### DELETE /api/admin/news/:id
뉴스 삭제

### POST /api/admin/news/:id/publish
뉴스 발행 + Discord 알림

---

### GET /api/admin/settings
시스템 설정 조회

### PATCH /api/admin/settings
시스템 설정 수정 (GM 바이어스, 전투 설정 등)

### GET /api/admin/settings/ai-model-routing
AI 모델 라우팅 조회

### PUT /api/admin/settings/ai-model-routing
AI 모델 라우팅 전체 교체

---

### GET /api/admin/stats
시즌 대시보드 통계

---

### Batch Server / Edge Functions

#### 뉴스 자동 생성
- **스케줄**: 매일 3~4회
- 최근 24시간 전투/서사 반영 기반 Gemini Flash로 자동 생성
- draft 상태로 저장, auto_publish 설정 시 즉시 발행

#### 타임아웃 체크
- **스케줄**: 1분마다
- turn_deadline 초과 시 자동 패스 처리 + Discord 알림

#### 중단 자동 처리
- **스케줄**: 1시간마다
- 24시간 미응답 중단 요청 → 자동 취소

---

## DB 스키마

### system_settings

운영 정책 싱글톤 설정 (1행).

```sql
CREATE TABLE system_settings (
  id text PRIMARY KEY DEFAULT 'default' CHECK (id = 'default'),
  gm_bias jsonb NOT NULL DEFAULT '{"lawbringer": 0, "rogue": 0, "neutral": 0}'::jsonb,
  battle_settings jsonb NOT NULL DEFAULT '{
    "default_turn_duration_hours": 24,
    "max_turn_duration_hours": 72,
    "turn_edit_allowed": true,
    "turn_edit_count_limit": 1
  }'::jsonb,
  character_settings jsonb NOT NULL DEFAULT '{
    "max_abilities": 5,
    "min_abilities": 2,
    "approval_required": true
  }'::jsonb,
  lore_settings jsonb NOT NULL DEFAULT '{
    "approval_threshold": 0.7,
    "min_votes_required": 2
  }'::jsonb,
  season jsonb NOT NULL DEFAULT '{
    "current_season": 1,
    "season_start": null,
    "season_end": null
  }'::jsonb,
  ai_model_routing jsonb NOT NULL DEFAULT '{
    "version": 1,
    "routes": {
      "main_story": {"primary": "claude-opus", "fallback": ["claude-sonnet"]},
      "battle_judgment": {"primary": "gemini-pro", "fallback": ["gemini-flash"]},
      "lore_reflection": {"primary": "gemini-flash", "fallback": ["claude-sonnet"]},
      "news_generation": {"primary": "gemini-flash", "fallback": []}
    }
  }'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);
```

#### RLS
- Admin만 조회/수정 가능
