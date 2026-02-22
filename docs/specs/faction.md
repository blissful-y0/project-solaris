# Faction — 진영별 기밀 게시판

> 진영 소속 캐릭터만 접근 가능한 비공개 게시판.

---

## 화면 (프론트엔드)

### 진영별 기밀 게시판 (`/faction`)

- **보안국 게시판:** 헬리오스 하달 명령, 작전 브리핑, 내부 보고. 톤: 공식적, 시안 강조.
- **스태틱 게시판:** 잠입 계획, 정보 공유, 은밀 모의. 톤: 거친, 레드 강조.
- **전향자:** 스태틱 게시판 접근 가능.

**게시물 구조:**
- 제목 + 본문 (마크다운)
- 댓글
- 고정(pin) 기능 (관리자 또는 자동 생성 명령/뉴스)
- 자동 생성 콘텐츠: Batch 서버가 시즌 진행에 따라 진영별 "명령" 또는 "정보"를 자동 생성

**접근 제어:**
- RLS로 `characters.faction` 기반 필터링
- 상대 진영 게시판은 존재 자체를 노출하지 않음 (404)

---

## API (백엔드)

> TODO: Faction Board API 미정의. 구현 시 설계 필요:
> - `GET /api/faction/posts` — 내 진영 게시물 목록
> - `POST /api/faction/posts` — 게시물 작성
> - `GET /api/faction/posts/:id` — 게시물 상세 + 댓글
> - `POST /api/faction/posts/:id/comments` — 댓글 작성

---

## DB 스키마

### faction_posts

```sql
CREATE TABLE faction_posts (
  id text PRIMARY KEY,
  faction text NOT NULL CHECK (faction IN ('bureau', 'static')),
  author_id text REFERENCES characters(id),
  title text NOT NULL,
  content text NOT NULL,
  is_pinned boolean DEFAULT false,
  source_type text DEFAULT 'manual' CHECK (source_type IN ('manual', 'auto', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);
```

#### RLS
- SELECT: 같은 진영 캐릭터만 (defector는 static으로 간주)
- INSERT: 같은 진영 승인 캐릭터만
- UPDATE/DELETE: 본인 게시물 또는 admin

### faction_comments

```sql
CREATE TABLE faction_comments (
  id text PRIMARY KEY,
  post_id text NOT NULL REFERENCES faction_posts(id),
  author_id text NOT NULL REFERENCES characters(id),
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);
```

### 관련 인덱스

```sql
CREATE INDEX idx_faction_posts_faction ON faction_posts(faction) WHERE deleted_at IS NULL;
CREATE INDEX idx_faction_posts_pinned ON faction_posts(faction, is_pinned, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_faction_comments_post ON faction_comments(post_id, created_at) WHERE deleted_at IS NULL;
```
