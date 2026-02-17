# PROJECT SOLARIS — 대시보드 구현 계획서

> **작성일**: 2026-02-17
> **브랜치**: `feat/dashboard-impl`
> **범위**: Phase 1 MVP — Next.js 15 대시보드 + Supabase 백엔드 전체 구현
> **예상 기간**: 32~44일 (1인 기준), 병렬 작업 시 ~22~28일

---

## 목차

1. [시스템 아키텍처 개요](#1-시스템-아키텍처-개요)
2. [구현 페이즈 총괄](#2-구현-페이즈-총괄)
3. [Phase 1a: 인프라 + Auth + 기본 레이아웃](#3-phase-1a-인프라--auth--기본-레이아웃)
4. [Phase 1b: 캐릭터 시스템](#4-phase-1b-캐릭터-시스템)
5. [Phase 1c: 전투 시스템](#5-phase-1c-전투-시스템)
6. [Phase 1d: RP / 소셜](#6-phase-1d-rp--소셜)
7. [Phase 1e: 관리자 패널 + Discord Bot](#7-phase-1e-관리자-패널--discord-bot)
8. [DB 스키마 및 마이그레이션](#8-db-스키마-및-마이그레이션)
9. [프론트엔드 아키텍처](#9-프론트엔드-아키텍처)
10. [백엔드 아키텍처](#10-백엔드-아키텍처)
11. [기술적 리스크 및 완화책](#11-기술적-리스크-및-완화책)
12. [외부 라이브러리](#12-외부-라이브러리)

---

## 1. 시스템 아키텍처 개요

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│                                                                  │
│  ┌────────────────┐       ┌──────────────────────────────────┐  │
│  │ Landing (Astro) │ link  │ Dashboard (Next.js 15 App Router)│  │
│  │ [완성]          │ ────> │ SSR + Client (React 19)          │  │
│  └────────────────┘       │ 모바일 탭 바 / 데스크탑 사이드바    │  │
│                            └───────────────┬──────────────────┘  │
│  ┌──────────────────────────────────────┐  │                     │
│  │ packages/ui  (디자인 토큰, 공유 컴포넌트)│  │                     │
│  │ packages/config (TS + Tailwind 설정)  │  │                     │
│  └──────────────────────────────────────┘  │                     │
└────────────────────────────────────────────┼─────────────────────┘
                                             │ API Routes + Supabase Client
                                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SUPABASE LAYER                            │
│                                                                  │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐   │
│  │ Auth        │ │ PostgreSQL │ │ Realtime    │ │ Storage    │   │
│  │ Discord     │ │ 20 tables  │ │ 7 channels  │ │ avatars/   │   │
│  │ OAuth       │ │ RLS 전체   │ │             │ │ max 5MB    │   │
│  └────────────┘ └──────┬─────┘ └────────────┘ └────────────┘   │
│                         │                                        │
│  ┌──────────────────────┴──────────────────────────────────┐    │
│  │  Edge Functions                                          │    │
│  │  - image-resize (upload trigger)                         │    │
│  │  - check-turn-timeout (cron 1분)                         │    │
│  │  - auto-generate-news (cron 1일 4회)                     │    │
│  │  - auto-handle-pause (cron 1시간)                        │    │
│  │  - discord-notify (DB webhook)                           │    │
│  └──────────────────────────────────────────────────────────┘    │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                       EXTERNAL SERVICES                          │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐    │
│  │ Discord Bot     │  │ Gemini Flash   │  │ Vercel (배포)   │    │
│  │ 알림 전용 (push) │  │ 전투 GM 판정    │  │ Landing: 정적   │    │
│  │ 10개 알림 타입   │  │ 뉴스 생성       │  │ Dashboard: SSR  │    │
│  └────────────────┘  └────────────────┘  └────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### 데이터 흐름 핵심 경로

```
[유저] → 로그인 → Supabase Auth (Discord OAuth) → JWT → 세션 쿠키
[유저] → 캐릭터 생성 → API Route → DB INSERT → Admin 알림
[유저] → 전투 서술 → API Route → DB INSERT → Realtime push → 상대/관전자
[시스템] → 판정 요청 → Edge Function → Gemini Flash → 판정문 + 스탯 변동 → DB + Realtime
[시스템] → 알림 → DB notification INSERT → Edge Function → Discord DM/채널
```

---

## 2. 구현 페이즈 총괄

### Phase 1 MVP — 12개 기능

| # | 기능 | 복잡도 | 예상 일수 | Phase |
|---|------|--------|----------|-------|
| 1 | Discord OAuth 로그인 | **S** | 1-2일 | 1a |
| 2 | 캐릭터 생성 위자드 + 프로필 | **L** | 4-5일 | 1b |
| 3 | 관리자 승인 패널 | **M** | 2-3일 | 1b |
| 4 | 전투 시스템 (로비+세션+관전+AI GM) | **XL** | 8-10일 | 1c |
| 5 | 일반 RP방 (채팅+서사 반영) | **L** | 4-5일 | 1d |
| 6 | 대시보드 (홈) | **M** | 2-3일 | 1d |
| 7 | 캐릭터 도감 | **S** | 1-2일 | 1b |
| 8 | 진영별 기밀 게시판 | **M** | 2-3일 | 1d |
| 9 | 캐릭터 관계도 | **S** | 1-2일 | 1b |
| 10 | Solaris Ticker | **S** | 1일 | 1d |
| 11 | Discord 알림 봇 | **M** | 3-4일 | 1e |
| 12 | 인프라 (Realtime, Storage, Pagination, Rate Limit) | **L** | 3-4일 | 1a |

### 의존성 그래프 & Critical Path

```
Phase 1a ──→ Phase 1b ──→ Phase 1c ──→ Phase 1d ──→ Phase 1e
 인프라        캐릭터        전투          RP/소셜       Admin+Bot
 Auth                                                  마무리

Critical Path:
[인프라] → [Auth] → [캐릭터 생성] → [도감] → [전투 시스템] → [대시보드 홈] → [Discord Bot]
                                                              ↑
                                        [RP방] ────────────────┘
```

### 병렬 작업 가능 그룹

| 그룹 | 선행 조건 | 동시 작업 |
|------|-----------|-----------|
| A | Phase 1a 완료 | 캐릭터 생성 위자드 + 이미지 업로드 Edge Function |
| B | 캐릭터 생성 완료 | 관리자 승인, 도감, 관계도 |
| C | 도감 + 인프라 | 전투 시스템 + RP방 |
| D | 독립 (Phase 1a 후) | 기밀 게시판, Ticker |

---

## 3. Phase 1a: 인프라 + Auth + 기본 레이아웃

**목표**: "로그인해서 빈 대시보드가 보인다"
**기간**: 5-7일

### 3.1 Supabase 프로젝트 셋업

1. Supabase New Project → Region: `ap-northeast-1`
2. Auth → Discord OAuth provider 활성화
3. Discord Developer Portal에서 OAuth2 Application 생성
   - Redirect URI: `https://<ref>.supabase.co/auth/v1/callback`
   - Scopes: `identify`, `email`
4. 환경변수 설정 (`apps/dashboard/.env.local`):
   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   GEMINI_API_KEY=
   UPSTASH_REDIS_REST_URL=
   UPSTASH_REDIS_REST_TOKEN=
   ```

### 3.2 DB Core 마이그레이션

9개 마이그레이션 파일을 FK 의존성 순서대로 실행:

| 순서 | 파일명 | 내용 |
|------|--------|------|
| 001 | `001_functions_and_extensions.sql` | extensions, `update_updated_at_column()`, `set_news_bulletin_number()`, `is_admin()` |
| 002 | `002_core_tables.sql` | `users`, `characters`, `abilities`, `civilian_merits` + RLS + 인덱스 + 트리거 |
| 003 | `003_battle_system.sql` | `battles`, `battle_turns`, `battle_ooc` + RLS |
| 004 | `004_room_system.sql` | `rooms`, `room_participants`, `room_messages` + RLS |
| 005 | `005_lore_system.sql` | `lore_requests`, `lore_request_votes`, `character_lore` + RLS |
| 006 | `006_news_and_notifications.sql` | `news`, `news_reactions`, `notifications`, `ticker_entries` + RLS |
| 007 | `007_faction_and_relationships.sql` | `faction_posts`, `faction_comments`, `character_relationships` + RLS |
| 008 | `008_seed_data.sql` | `civilian_merits` 5개 INSERT + 관리자 계정 |
| 009 | `009_storage_buckets.sql` | avatars 버킷 + Storage RLS |

**추가 필요 테이블** (API-SPEC vs DB-SCHEMA 불일치):
- `system_settings` — GM 바이어스 + 시스템 설정
- `gm_bias_history` — 바이어스 변경 이력
- `seasons` — 시즌 관리

### 3.3 Supabase Client 설정

```
lib/supabase/
├── server.ts        — Server Component용 (read-only)
├── route.ts         — Route Handler용 (쿠키 read/write)
├── client.ts        — Client Component용 (브라우저)
├── admin.ts         — Service Role 클라이언트 (admin 전용)
├── middleware.ts     — Middleware용
└── types.ts         — Database 타입 (supabase gen types)
```

### 3.4 공통 인프라 코드

```
lib/
├── errors.ts           — ApiError 타입, apiError() 헬퍼, Supabase 에러 변환
├── rate-limit.ts       — Upstash Redis 기반 Rate Limiter (7개 카테고리)
├── validations/
│   └── common.ts       — nanoidSchema, paginationSchema, factionSchema 등
└── constants/
    └── factions.ts     — FACTION_INITIAL_STATS (진영별 HP/WILL)
```

### 3.5 Auth 플로우

```
Discord 로그인 버튼 클릭
→ Supabase signInWithOAuth({ provider: 'discord' })
→ Discord 인증 → /api/auth/callback
→ Supabase code 교환 → JWT 발급
→ users 테이블 upsert → 세션 쿠키 → 대시보드 리다이렉트
```

**Auth API Routes**:
- `GET /api/auth/callback` — OAuth 콜백
- `GET /api/auth/me` — 현재 유저 + 캐릭터 정보
- `POST /api/auth/logout` — 로그아웃

**Middleware** (`middleware.ts`):
- 세션 자동 갱신 (`@supabase/ssr`)
- 인증 필요 라우트 보호 (미인증 → `/login`)
- Admin 라우트 보호 (`/admin/*` → `users.role === 'admin'` 체크)

### 3.6 기본 레이아웃 구현

**모바일 퍼스트**:
```
┌──────────────────────────┐
│ [SolarisTicker — 시보]    │  ← marquee 1줄
├──────────────────────────┤
│ [TopBar — HELIOS TERM]   │  ← 고정 상단 + 알림 벨
├──────────────────────────┤
│     Page Content          │  ← 스크롤 영역
├──────────────────────────┤
│ 홈 | 전투 | RP | 도감 | MY │  ← 하단 탭 바 (md 미만)
└──────────────────────────┘
```

**데스크탑** (md: 이상): 하단 탭 바 → 왼쪽 사이드바 (220px)

### 3.7 디자인 토큰

```css
@theme {
  --color-bg: #0a0a0f;
  --color-bg-secondary: #131318;
  --color-bg-tertiary: #1a1a22;
  --color-primary: #00d4ff;
  --color-primary-dim: #0099bb;
  --color-secondary: #93c5fd;
  --color-accent: #dc2626;
  --color-text: #e5e7eb;
  --color-text-secondary: #9ca3af;
  --color-subtle: #1f2937;
  --color-border: #27272a;
  --color-discord: #5865F2;
  --color-success: #10b981;
  --color-warning: #f59e0b;
}
```

랜딩 대비: 노이즈/스캔라인 `opacity: 0.015` (절반), 글리치 애니메이션은 전투 알림에만 제한.

### 3.8 산출물 체크리스트

- [ ] Supabase 프로젝트 + Discord OAuth 설정
- [ ] 9개 마이그레이션 실행 완료
- [ ] Supabase Client 4종 (server/route/client/admin)
- [ ] 공통 에러 핸들링 + Rate Limiter
- [ ] middleware.ts (인증 + admin 보호)
- [ ] Auth 3개 API Route
- [ ] DashboardLayout (탭 바 + 사이드바 + TopBar + Ticker)
- [ ] 로그인 화면 (Discord 버튼)
- [ ] Tailwind v4 디자인 토큰

---

## 4. Phase 1b: 캐릭터 시스템

**목표**: "캐릭터를 만들고, 승인받고, 도감에서 볼 수 있다"
**기간**: 7-9일
**의존**: Phase 1a 완료

### 4.1 캐릭터 생성 위자드 (5 Step)

| Step | 화면 | 핵심 입력 |
|------|------|-----------|
| 1 | 팩션 선택 | bureau / static / civilian / defector |
| 2 | 능력 계열 선택 | field / empathy / shift / compute (civilian은 메리트) |
| 3 | 능력 설계 | 이름, 설명, 제약, Tier별 서술 |
| 4 | 프로필 입력 | 이름, 성별, 나이, 외형, 성격, 배경, 아바타 |
| 5 | 최종 확인 | 시트 미리보기 → 제출 |

**컴포넌트**:
```
components/character-create/
├── WizardShell.tsx          — 스텝 인디케이터 + 네비게이션
├── StepFaction.tsx          — 팩션 선택 카드
├── StepAbilityClass.tsx     — 능력 계열 선택
├── StepAbilityDesign.tsx    — 능력 설계 폼
├── StepProfile.tsx          — 프로필 입력 + 아바타 업로드
└── StepConfirm.tsx          — 최종 확인 + 제출
```

### 4.2 이미지 업로드

- 클라이언트 사이드 사전 리사이즈 (canvas API → 2MB 이하)
- Supabase Storage `avatars/` 버킷 업로드
- Edge Function `image-resize` → 128x128 (thumb), 512x512 (profile)

### 4.3 캐릭터 API Routes

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/characters` | 도감 목록 (?faction, ?status, ?page) |
| POST | `/api/characters` | 캐릭터 생성 |
| GET | `/api/characters/me` | 내 캐릭터 |
| GET | `/api/characters/[id]` | 캐릭터 상세 |
| PATCH | `/api/characters/[id]` | 캐릭터 수정 (본인) |
| DELETE | `/api/characters/[id]` | 캐릭터 삭제 (soft) |
| GET/POST | `/api/characters/[id]/abilities` | 능력 CRUD |
| GET/POST | `/api/characters/[id]/relationships` | 관계도 |

### 4.4 관리자 승인 패널

- `/admin/characters` — 승인 대기 큐 (카드 형태)
- `/admin/characters/all` — 전체 캐릭터 테이블
- 승인 → `characters.status = 'approved'` + Discord DM 알림
- 반려 → 사유 입력 모달 + Discord DM 알림

### 4.5 캐릭터 도감

- 카드 그리드 (`CharacterCard.tsx`)
- 팩션/상태 필터 + 이름 검색
- 카드 클릭 → 프로필 모달 (`CharacterProfileModal.tsx`)

### 4.6 캐릭터 관계도

- 프로필 내 섹션 (`RelationshipSection.tsx`)
- 수동 입력: 대상 캐릭터 + 관계 태그 (자유 텍스트)
- 상호성 표시: A→B "동맹", B→A "경계 중"

### 4.7 Zod 스키마 (캐릭터)

- `createCharacterSchema` — 생성 body
- `updateCharacterSchema` — 수정 body
- `characterQuerySchema` — 목록 query
- `createAbilitySchema` — 능력 추가
- `createRelationshipSchema` — 관계 추가

---

## 5. Phase 1c: 전투 시스템

**목표**: "전투를 신청하고, AI GM 판정을 받고, 관전할 수 있다"
**기간**: 8-10일
**의존**: Phase 1a (Realtime) + Phase 1b (캐릭터)
**Critical Note**: 가장 복잡한 페이즈. **턴 사이클 상태머신을 먼저 설계**한 뒤 구현.

### 5.1 전투 턴 사이클 상태머신

```
[open] → 상대 수락 → [in_progress]
  ↓                      ↓
거절 → [rejected]    서술 → 수정(1회) → 합의 → 판정 요청
                                               ↓
                                         [AI GM 판정]
                                               ↓
                                         HP/WILL 변동 반영
                                               ↓
                                         ┌─────────────────┐
                                         │ HP 0 → 전투불능   │
                                         │ 다음 턴 → 교대    │
                                         │ 중단 요청 → 합의  │
                                         └─────────────────┘
                                               ↓
                                         [completed / cancelled / paused]
```

**타임아웃**: 턴당 10분. Edge Function `check-turn-timeout`이 1분마다 체크 → 자동 패스.

### 5.2 Realtime 채널

| 채널 | 테이블 | 이벤트 | 구독 |
|------|--------|--------|------|
| `battle:{id}` | `battle_turns`, `battles` | INSERT, UPDATE | 전투 화면 진입 시 |
| `battle-ooc:{id}` | `battle_ooc` | INSERT | OOC 채팅 열기 시 |

### 5.3 전투 컴포넌트

```
components/battle/
├── BattleLobbyCard.tsx      — 로비 게시물 카드
├── BattleCreateForm.tsx     — 전투 신청 폼
├── BattleSession.tsx        — 세션 컨테이너 (fixed fullscreen)
├── BattleChat.tsx           — 채팅 로그 (말풍선)
├── ChatBubble.tsx           — 내/상대/GM 말풍선
├── GMJudgment.tsx           — GM 판정 시스템 메시지
├── BattleHpBar.tsx          — 상단 HP/WILL 바 (양측)
├── BattleInput.tsx          — 하단 서술 입력 + 풀스크린 확장
├── BattleAgreement.tsx      — "판정 진행" 합의 버튼
├── BattleTimer.tsx          — 10분 타임아웃 카운트다운
├── SpectatorBadge.tsx       — 관전자 수 표시
└── OOCSheet.tsx             — OOC 채팅 바텀시트
```

### 5.4 AI GM (Gemini Flash) 연동

**호출 플로우**:
```
POST /api/battles/:id/judge
→ 양측 서술 + 능력 데이터 + 이전 턴 요약 수집
→ Helios Bias 조회 (admin settings)
→ 프롬프트 조립 → Gemini Flash API 호출 (5-10초)
→ JSON 응답 파싱 → HP/WILL 변동 계산
→ DB UPDATE (battle_turns, characters)
→ Realtime push → Discord 알림
```

**폴백**: Gemini 실패 시 → Claude Sonnet으로 폴백

### 5.5 전투 API Routes

| Method | Path | 설명 |
|--------|------|------|
| GET/POST | `/api/battles` | 목록 + 생성 |
| GET | `/api/battles/[id]` | 상세 + 턴 로그 |
| POST | `/api/battles/[id]/accept` | 수락 |
| POST | `/api/battles/[id]/reject` | 거절 |
| POST | `/api/battles/[id]/turns` | 서술 제출 |
| PATCH | `/api/battles/[id]/turns/[turnId]` | 서술 수정 (1회) |
| POST | `/api/battles/[id]/turns/[turnId]/agree` | 판정 합의 |
| POST | `/api/battles/[id]/judge` | AI GM 판정 트리거 |
| POST | `/api/battles/[id]/pause` | 중단 요청 |
| POST | `/api/battles/[id]/pause/accept` | 중단 수락 |
| POST | `/api/battles/[id]/resume` | 재개 |
| GET/POST | `/api/battles/[id]/ooc` | OOC 채팅 |

---

## 6. Phase 1d: RP / 소셜

**목표**: "RP를 하고, 뉴스를 보고, 기밀 게시판을 쓸 수 있다"
**기간**: 6-8일
**의존**: Phase 1a + 1b

### 6.1 일반 RP방

- 방 목록 + 생성 (최대 참가자, 태그, 설명)
- Realtime 채팅 (`room:{id}` 채널)
- 서사 반영: 메시지 범위 선택 → 전원 합의 투표 → AI 요약 → `character_lore` 등록
- RP 중 전투 전환 기능

### 6.2 뉴스 시스템

- 자동 생성: Edge Function cron → Gemini Flash → 전투/서사 기반 뉴스 draft
- 수동 작성: Admin 뉴스 에디터 (마크다운)
- `BULLETIN_047` 스타일 카드, 이모지 리액션

### 6.3 진영별 기밀 게시판

- RLS 기반 접근 제어 (bureau vs static)
- 마크다운 에디터, 댓글, 고정 기능
- 팩션별 UI 테마 (시안/레드)

### 6.4 Solaris Ticker

- 상단 marquee CSS 애니메이션
- Realtime `ticker` 채널 구독
- 24시간 롤링 (오래된 항목 자동 제거)

### 6.5 대시보드 홈

- 내 캐릭터 미니 카드
- 전투 알림 배너 ("INCOMING COMBAT REQUEST")
- 뉴스 피드 (무한 스크롤)
- 최근 전투 하이라이트

### 6.6 마이페이지

- 캐릭터 시트 편집
- 전투 이력 + 서사 기록 타임라인
- 알림 설정 + 계정 설정

---

## 7. Phase 1e: 관리자 패널 + Discord Bot

**목표**: "관리자가 전체 운영을 할 수 있고, Discord 알림이 온다"
**기간**: 5-7일
**의존**: 모든 이전 페이즈

### 7.1 관리자 패널 — 8개 화면

| # | 화면 | 경로 | 주요 컴포넌트 |
|---|------|------|-------------|
| 1 | 시즌 대시보드 | `/admin/dashboard` | StatCard×6, FactionPieChart, WillBarChart |
| 2 | 캐릭터 승인 큐 | `/admin/characters` | QueueCard, SheetModal, RejectModal |
| 3 | 전체 캐릭터 관리 | `/admin/characters/all` | CharacterTable, Filters, EditModal |
| 4 | 뉴스 관리 | `/admin/news` | NewsList, MarkdownEditor, Preview |
| 5 | 전투 관리 | `/admin/battles` | BattleTable, DetailModal, InterventionPanel |
| 6 | RP방 관리 | `/admin/rooms` | RoomTable, LogModal, WarningPanel |
| 7 | 유저 관리 | `/admin/users` | UserTable, EditModal, Ban/Unban |
| 8 | GM 바이어스 | `/admin/settings/gm` | BiasSlider, BiasHistory |

**관리자 레이아웃**: 데스크탑 우선, AdminSidebar(240px) + AdminHeader(Breadcrumb)

### 7.2 Discord Bot 알림 — 10개 타입

| # | 이벤트 | 수신자 | 채널 | 색상 |
|---|--------|--------|------|------|
| 1 | 캐릭터 승인 | 소유자 | DM | 초록 |
| 2 | 캐릭터 반려 | 소유자 | DM | 빨강 |
| 3 | 전투 신청 | 방어자 | DM | 빨강 |
| 4 | 내 턴 도래 | 현재 턴 | DM | 시안 |
| 5 | 전투 결과 | 양측+전체 | DM+채널 | 시안 |
| 6 | 중단 요청 | 상대방 | DM | 노랑 |
| 7 | RP 방 초대 | 대상자 | DM | 시안 |
| 8 | 서사 반영 요청 | 참가자 | DM | 보라 |
| 9 | 뉴스 발행 | 전체 | 공개 채널 | 골드 |
| 10 | 타임아웃 패스 | 당사자 | DM | 노랑 |

**플로우**: DB event → Supabase Database Webhook (pg_net) → Edge Function `discord-notify` → Discord API

### 7.3 E2E 통합 테스트 & QA

- 로그인 → 캐릭터 생성 → 승인 → 전투 → RP 전체 플로우
- Lighthouse 점검, 번들 사이즈 최적화
- 모바일 QA: 탭 바, 채팅 UI, 키보드 대응

---

## 8. DB 스키마 및 마이그레이션

### 8.1 테이블 의존성 그래프

```
users (root — id = auth.uid() UUID)
├── characters → users (user_id, nanoid(12))
│   ├── abilities → characters
│   ├── battles → characters (challenger_id, defender_id)
│   │   ├── battle_turns → battles, characters
│   │   └── battle_ooc → battles, characters
│   ├── rooms → characters (created_by)
│   │   ├── room_participants → rooms, characters
│   │   ├── room_messages → rooms, characters
│   │   └── lore_requests → rooms, characters
│   │       └── lore_request_votes → lore_requests, characters
│   ├── character_lore → characters
│   ├── faction_posts → characters
│   │   └── faction_comments → faction_posts, characters
│   └── character_relationships → characters (self-ref x2)
├── news (standalone)
│   └── news_reactions → news, users
├── notifications → users
├── civilian_merits (standalone)
└── ticker_entries (standalone)
```

### 8.2 RLS 핵심 패턴

**Admin 체크 최적화** — `is_admin()` SECURITY DEFINER 함수:
```sql
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = (SELECT auth.uid()) AND role = 'admin' AND deleted_at IS NULL
  )
$$;
```

**복잡한 RLS (성능 주의)**:

| 위험도 | 테이블 | 패턴 |
|--------|--------|------|
| HIGH | `room_messages` SELECT | `room_participants` → `characters` 3-table JOIN |
| HIGH | `lore_request_votes` | `lore_requests` → `room_participants` → `characters` 3-table |
| HIGH | `faction_posts` SELECT | `characters` 조인 + 진영 분기 |
| MEDIUM | `battle_ooc` INSERT | `battles` → `characters` 2-table + OR |

**권장 인덱스 (스펙 외 추가)**:
```sql
CREATE INDEX idx_room_participants_room_char ON room_participants(room_id, character_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_characters_user_status ON characters(user_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_faction_posts_faction_created ON faction_posts(faction, created_at DESC) WHERE deleted_at IS NULL;
```

### 8.3 Soft Delete + UNIQUE 제약 수정

PostgreSQL에서 `UNIQUE(col, deleted_at)` → NULL 중복 허용됨. **Partial unique index로 교체**:
```sql
CREATE UNIQUE INDEX uniq_characters_user_active ON characters(user_id) WHERE deleted_at IS NULL;
```
적용 대상: `characters`, `abilities`, `battle_turns`, `room_participants`, `lore_request_votes`, `news_reactions`

### 8.4 Realtime 7채널

| 채널 | 테이블 | 구독 시점 | 보안 |
|------|--------|----------|------|
| `battle:{id}` | battle_turns, battles | 전투 화면 진입 | RLS 공개 |
| `battle-ooc:{id}` | battle_ooc | OOC 열기 | RLS 공개 |
| `room:{id}` | room_messages | RP방 진입 | RLS 참가자만 |
| `notifications:{uid}` | notifications | 로그인 후 전역 | RLS 본인만 |
| `news` | news | 홈 대시보드 | RLS published만 |
| `ticker` | ticker_entries | 대시보드 진입 | RLS 전체 |
| `faction:{faction}` | faction_posts | 진영 게시판 | RLS 진영 필터 |

### 8.5 Storage

- 버킷: `avatars` (public read, 5MB limit, image/* only)
- 경로: `avatars/{user_id}/{filename}`
- RLS: 읽기 공개, 쓰기 본인 폴더만
- Edge Function: 업로드 trigger → 128x128 thumb + 512x512 medium (WebP)

---

## 9. 프론트엔드 아키텍처

### 9.1 App Router 라우팅

```
app/
├── (auth)/                     — Auth (탭바 없음)
│   ├── login/page.tsx
│   └── callback/page.tsx
├── (dashboard)/                — 메인 (탭바 있음)
│   ├── page.tsx                — 홈/뉴스피드
│   ├── battle/page.tsx         — 전투 로비
│   ├── battle/[id]/page.tsx    — 전투 세션 (?spectate=true 관전)
│   ├── room/page.tsx           — RP방 목록
│   ├── room/[id]/page.tsx      — RP방 내부
│   ├── characters/page.tsx     — 도감
│   ├── faction/page.tsx        — 진영 게시판
│   └── my/page.tsx             — 마이페이지
├── character/create/page.tsx   — 생성 위자드
├── character/[id]/page.tsx     — 캐릭터 프로필 (OG)
├── admin/                      — 관리자 (8개 화면)
│   ├── dashboard/page.tsx
│   ├── characters/page.tsx     — 승인 큐
│   ├── characters/all/page.tsx — 전체 관리
│   ├── news/page.tsx
│   ├── battles/page.tsx
│   ├── rooms/page.tsx
│   ├── users/page.tsx
│   └── settings/gm/page.tsx
└── api/                        — ~65개 API Routes
```

### 9.2 컴포넌트 디렉토리

```
components/
├── ui/          — 원자 (Button, Input, Badge, Card, Modal, Table, Toast, Skeleton, ...)
├── layout/      — 레이아웃 (TopBar, MobileTabBar, DesktopSidebar, AdminSidebar, Ticker)
├── home/        — 홈 (MiniCard, CombatBanner, NewsCard, NewsFeed, ReactionBar)
├── character/   — 캐릭터 (CharacterCard, ProfileModal, Sheet, AbilityCard, StatGauge, ...)
├── character-create/ — 위자드 (WizardShell, Step1~5)
├── battle/      — 전투 (LobbyCard, Session, Chat, ChatBubble, GMJudgment, HpBar, ...)
├── room/        — RP (RoomCard, Chat, Message, LoreRequestUI, ...)
├── faction/     — 게시판 (PostCard, Editor, Comments)
├── notification/ — 알림 (Bell, Panel, Item)
└── admin/       — 관리자 (각 화면별 서브디렉토리)
```

### 9.3 상태 관리

**서버 상태**: SWR
- 경량 (~4.2KB), Next.js 15와 Vercel 생태계 통합
- 뉴스 피드, 전투 로비, 도감, 알림, 관리자 데이터

**클라이언트 상태**: React Context
- `AuthProvider` — 세션, 유저 정보, 역할
- `CharacterProvider` — 내 캐릭터 (로그인 시 1회 페치)
- `NotificationProvider` — Realtime 알림 카운트

**로컬 상태**: useState (모달, 위자드 스텝, 폼, 채팅 입력)

### 9.4 Realtime 커스텀 훅

```
hooks/
├── realtime/
│   ├── useBattleRealtime.ts    — battle_turns + battles
│   ├── useBattleOOC.ts         — battle_ooc
│   ├── useRoomMessages.ts      — room_messages
│   ├── useNotifications.ts     — notifications (벨 카운트)
│   └── useTicker.ts            — ticker_entries
├── data/
│   ├── useNewsFeed.ts          — SWR 뉴스 (커서)
│   ├── useBattleLobby.ts       — SWR 전투 로비
│   ├── useCharacterList.ts     — SWR 도감
│   ├── useMyCharacter.ts       — SWR 내 캐릭터
│   └── useFactionPosts.ts      — SWR 진영 게시판
└── ui/
    ├── useInfiniteScroll.ts    — 무한 스크롤
    ├── useDebounce.ts          — 검색
    └── useLongPress.ts         — 서사 범위 선택
```

---

## 10. 백엔드 아키텍처

### 10.1 API 총괄

**총 ~65개 엔드포인트** (GET 28, POST 22, PATCH 9, DELETE 6)

| 도메인 | 라우트 수 | Phase |
|--------|----------|-------|
| Auth | 3 | 1a |
| Characters | 8 | 1b |
| Abilities | 1 | 1b |
| Battles | 12 | 1c |
| Rooms | 7 | 1d |
| News | 4 | 1d |
| Notifications | 3 | 1d |
| Ticker | 1 | 1d |
| Faction | 7 | 1d |
| Admin | 19 | 1b+1e |

### 10.2 Validation (Zod)

29개 스키마 — `lib/validations/` 디렉토리:
- `common.ts` — pagination, nanoid, faction, abilityClass
- `character.ts` — create, update, query, ability, relationship
- `battle.ts` — create, query, submitTurn, editTurn, reject, pause, ooc
- `room.ts` — create, query, message, loreRequest, loreVote, roomBattle
- `news.ts` — reaction
- `faction.ts` — post, comment
- `admin.ts` — reject, approve, news, settings

### 10.3 Error Handling

```typescript
interface ApiError {
  error: {
    code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'VALIDATION_ERROR' | 'CONFLICT' | 'RATE_LIMITED' | 'INTERNAL_ERROR'
    message: string
    details?: Record<string, string[]>
  }
}
```

Supabase 에러 코드 자동 매핑: `23505` → CONFLICT, `23503` → NOT_FOUND, `42501` → FORBIDDEN

### 10.4 Rate Limiting (Upstash Redis)

| 카테고리 | 제한 | 윈도우 |
|----------|------|--------|
| 일반 API | 60 req | /분/유저 |
| AI GM 판정 | 10 req | /분/전투 |
| 메시지 전송 | 30 req | /분/유저 |
| 캐릭터 생성 | 3 req | /시간/유저 |
| 전투 신청 | 10 req | /시간/유저 |
| Admin | 120 req | /분/admin |

### 10.5 Edge Functions

| Function | Schedule | 역할 |
|----------|----------|------|
| `check-turn-timeout` | cron 1분 | 턴 타임아웃 → 자동 패스 |
| `auto-handle-pause` | cron 1시간 | 24h 미응답 중단 → 자동 취소 |
| `auto-generate-news` | cron 1일 4회 | 전투/서사 → 뉴스 draft 생성 |
| `image-resize` | Storage trigger | 아바타 → thumb + medium |
| `discord-notify` | DB webhook | 알림 → Discord DM/채널 |

---

## 11. 기술적 리스크 및 완화책

| # | 리스크 | 위험도 | 완화책 |
|---|--------|--------|--------|
| 1 | Supabase Realtime 동시 접속 | HIGH | 관전자 채널 분리, polling fallback, Pro tier |
| 2 | 전투 턴 사이클 상태머신 복잡도 | HIGH | DB-level 상태 관리, 서버 상태 전이 함수, Edge Function 타임아웃 |
| 3 | RLS 80개+ 정책 관리 | MEDIUM | `is_admin()` 함수, `(SELECT auth.uid())` 1회 평가, 마이그레이션별 테스트 |
| 4 | AI GM 응답 시간 (5-10초) | MEDIUM | "GM이 판정 중..." 로딩 UI, 30초 timeout + retry, Sonnet fallback |
| 5 | 이미지 업로드/리사이즈 | MEDIUM | 클라이언트 사전 리사이즈, 서버 비동기 리사이즈 |
| 6 | UNIQUE + Soft Delete | MEDIUM | Partial unique index로 교체 (6개 테이블) |
| 7 | `users` RLS 재귀 | MEDIUM | `is_admin()` SECURITY DEFINER |
| 8 | Room 시스템 3-table JOIN RLS | MEDIUM | 복합 인덱스 + 향후 materialized view |
| 9 | `set_news_bulletin_number` 경합 | LOW | SERIALIZABLE 또는 Sequence 사용 |
| 10 | Discord Bot 알림 지연 | LOW | 웹 Realtime이 1차 알림, Discord는 2차 |

---

## 12. 외부 라이브러리

### 필수 (Phase 1 핵심)

| 패키지 | 용도 | 크기 |
|--------|------|------|
| `@supabase/supabase-js` | Auth + DB + Realtime + Storage | ~50KB |
| `@supabase/ssr` | Next.js SSR Supabase 헬퍼 | ~5KB |
| `swr` | 서버 상태 (데이터 페칭/캐싱) | ~4.2KB |
| `zod` | 입력 유효성 검증 | ~13KB |
| `nanoid` | 짧은 ID 생성 (12자) | ~0.5KB |
| `date-fns` | 날짜 포맷/상대시간 | 트리셰이킹 |
| `lucide-react` | 아이콘 세트 | 트리셰이킹 |
| `sonner` | 토스트 알림 | ~5KB |
| `@upstash/ratelimit` + `@upstash/redis` | Rate limiting | ~8KB |
| `@google/generative-ai` | Gemini Flash API | ~15KB |

### UI 보조

| 패키지 | 용도 |
|--------|------|
| `recharts` | 관리자 차트 (파이/바) |
| `react-markdown` + `remark-gfm` | 뉴스/게시판 마크다운 렌더링 |
| `@uiw/react-md-editor` | 마크다운 에디터 |

### 설치하지 않는 것

- `axios` → fetch + SWR로 충분
- `redux` / `zustand` → Context + SWR로 충분
- `styled-components` → Tailwind v4 사용
- `moment.js` → date-fns 대체
- `lodash` → 필요한 유틸만 직접 작성

---

## 부록: Phase vs 테이블 매핑

| 테이블 | Phase | 마이그레이션 |
|--------|-------|-------------|
| users | 1a | 002 |
| characters | 1b | 002 |
| abilities | 1b | 002 |
| civilian_merits | 1a (seed) | 002 + 008 |
| battles | 1c | 003 |
| battle_turns | 1c | 003 |
| battle_ooc | 1c | 003 |
| rooms | 1d | 004 |
| room_participants | 1d | 004 |
| room_messages | 1d | 004 |
| lore_requests | 1d | 005 |
| lore_request_votes | 1d | 005 |
| character_lore | 1d | 005 |
| news | 1d | 006 |
| news_reactions | 1d | 006 |
| notifications | 1e | 006 |
| ticker_entries | 1d | 006 |
| faction_posts | 1d | 007 |
| faction_comments | 1d | 007 |
| character_relationships | 1b | 007 |
| system_settings | 1a | 추가 필요 |
| gm_bias_history | 1e | 추가 필요 |
| seasons | 1e | 추가 필요 |
