# Home — 홈 대시보드

> 로그인 후 첫 화면. 개인 상태, 뉴스 피드, 티커, 알림.

---

## 화면 (프론트엔드)

### 홈 / 대시보드 (`/dashboard`)

로그인 후 첫 화면. 위에서 아래로 스크롤.

1. **상단 고정 바:** "HELIOS CITIZEN TERMINAL" + 알림 벨 아이콘 (뱃지 카운트)
2. **내 캐릭터 미니 카드:**
   - 썸네일 + 이름 + 팩션 뱃지 + HP/WILL 바 (한 줄 압축)
   - 탭하면 캐릭터 탭으로 이동
   - 캐릭터 미생성 → "캐릭터 만들기" CTA
   - 승인 대기 중 → "승인 대기 중" + 검열 블록 처리
3. **전투 알림 배너:** (있을 때만 노출)
   - "INCOMING COMBAT REQUEST" 레드 깜빡임
4. **도시 뉴스 피드:**
   - `BULLETIN` 스타일 카드, 무한 스크롤
   - 각 카드: 모노스페이스 헤더 + 본문 2줄 미리보기 + 리액션 버튼
5. **최근 전투 하이라이트:**
   - 커뮤니티 전체 최근 전투 카드
   - GM 판정 한줄 요약 + 참가자

---

### Solaris Ticker (대시보드 상단)

대시보드 최상단에 가로로 흘러가는 실시간 시보.

- **형식:** `[21:05] 보안국 제3구역 검문 강화 — [21:10] 중층 구역 의문의 폭발음 보고`
- **소스:** Batch 서버 자동 생성 + 전투 결과 반영 + 관리자 수동 입력
- **UI:** 모노스페이스 폰트, 시안 텍스트, marquee 스타일 CSS animation
- **모바일:** 한 줄 고정, 텍스트가 좌측으로 스크롤

---

## API (백엔드)

### News API

#### GET /api/news
뉴스 목록 조회 (published만)

**Query**: `category?`, `page?`, `limit?`

#### GET /api/news/:id
뉴스 상세 조회

#### POST /api/news/:id/react
리액션 토글 (추가/제거)

---

### Notifications API

#### GET /api/notifications
내 알림 목록 조회

**Query**: `unread_only?`, `limit?`

#### PATCH /api/notifications/:id/read
알림 읽음 처리

#### PATCH /api/notifications/read-all
전체 알림 읽음 처리

---

## DB 스키마

### news

```sql
CREATE TABLE news (
  id text PRIMARY KEY,
  bulletin_number integer UNIQUE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  source_type text NOT NULL CHECK (source_type IN ('auto', 'manual', 'battle')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);
```

#### RLS
- Published 뉴스: 전체 공개 읽기
- Admin: 전체 읽기/생성/수정/삭제

### news_reactions

```sql
CREATE TABLE news_reactions (
  id text PRIMARY KEY,
  news_id text NOT NULL REFERENCES news(id),
  user_id text NOT NULL REFERENCES users(id),
  emoji text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  UNIQUE(news_id, user_id, emoji, deleted_at)
);
```

### notifications

```sql
CREATE TABLE notifications (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id),
  type text NOT NULL,
  title text NOT NULL,
  body text NULL,
  deep_link text NULL,
  sent_via text NOT NULL CHECK (sent_via IN ('discord', 'web', 'both')),
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);
```

#### RLS
- 본인 알림만 읽기/수정

### ticker_entries

```sql
CREATE TABLE ticker_entries (
  id text PRIMARY KEY,
  content text NOT NULL,
  source_type text DEFAULT 'auto' CHECK (source_type IN ('auto', 'battle', 'admin')),
  source_id text,
  created_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);
```

### 관련 인덱스

```sql
CREATE INDEX idx_news_status ON news(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_news_created_at ON news(created_at DESC) WHERE status = 'published' AND deleted_at IS NULL;
CREATE INDEX idx_notifications_user_id ON notifications(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_notifications_read ON notifications(user_id, read) WHERE deleted_at IS NULL;
CREATE INDEX idx_ticker_entries_recent ON ticker_entries(created_at DESC) WHERE deleted_at IS NULL;
```
