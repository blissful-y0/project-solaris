# PROJECT SOLARIS 서비스 스펙

> 이 디렉터리는 기능 단위로 프론트엔드/백엔드/DB를 한 파일에 묶은 서비스 스펙이다.
> 각 파일: `화면(프론트)` → `API(백엔드)` → `DB 스키마` 순서.

## 기능별 스펙 파일

| 파일 | 범위 |
|------|------|
| `auth.md` | Discord OAuth 인증, 세션 관리 |
| `home.md` | 홈 대시보드, 뉴스 피드, 티커, 알림 |
| `character.md` | 캐릭터 생성/프로필/도감/관계도/서사 |
| `operation.md` | Operation 허브, 전투 RP, 다운타임 RP, 전투 시스템 규칙 |
| `faction.md` | 진영별 기밀 게시판 |
| `mypage.md` | 마이페이지 |
| `admin.md` | 관리자 패널, 시스템 설정, Batch Server |

---

## 1. 아키텍처 개요

```
[Landing - Astro 5]          apps/landing    (완성)
[Dashboard - Next.js 15]     apps/dashboard  (신규)
[Shared UI]                  packages/ui     (디자인 토큰, 공유 컴포넌트)

[Supabase]
  ├─ Auth (Discord OAuth)
  ├─ PostgreSQL (characters, operations, news, approvals)
  ├─ Realtime (전투/RP 세션 실시간 동기화)
  └─ Edge Functions (batch 트리거)

[Batch Server]
  ├─ Supabase DB 이벤트 감지
  ├─ Discord Bot으로 알림 푸시
  ├─ 도시 뉴스 자동 생성 (cron, 하루 3~4건, Gemini Flash)
  └─ 시즌 이벤트 트리거

[Discord Bot]
  └─ 알림 전용 (임베드 + 웹 딥링크). 유저 행위는 전부 웹에서.

[AI GM]
  └─ 기능별 고정 라우팅 (메인 스토리=Opus, 전투 판정=Gemini Pro, 기타 기능은 운영 정책 기준)
```

### 기술 스택
- **프레임워크:** Next.js 15 (App Router)
- **모노레포:** Turborepo + pnpm
- **인증:** Supabase Auth + Discord OAuth
- **DB:** Supabase PostgreSQL + Realtime
- **AI:** 기능별 고정 라우팅 (`main_story`, `battle_judgment`, `lore_reflection`, `news_generation`)
- **알림:** Discord Bot (임베드 + 딥링크)
- **배포:** Vercel
- **디자인:** Tailwind CSS v4, 모바일 퍼스트

---

## 2. 디자인 시스템

### 컨셉
- **랜딩:** "처음 접속한 시민이 보는 헬리오스의 프로파간다"
- **대시보드:** "접속 인가된 시민의 업무 단말기" — 터미널 + HUD 하이브리드

### 디자인 토큰 (랜딩과 공유, packages/ui)
```css
--color-bg: #0a0a0f;
--color-primary: #00d4ff;       /* 시안 — 시스템, 보안국 */
--color-secondary: #93c5fd;     /* 라이트블루 — 보조 */
--color-accent: #dc2626;        /* 레드 — 경고, 스태틱, 긴급 */
--color-text: #e5e7eb;
--color-subtle: #1f2937;
--color-discord: #5865F2;

--font-sans: "Pretendard Variable", sans-serif;
/* 데이터 라벨, 시스템 메시지: 모노스페이스 */
```

### UI 톤 가이드
- 뉴스 카드: `BULLETIN_047 // SECTOR 7` 스타일 모노스페이스 헤더 + Pretendard 본문
- 검열 블록(████): 승인 대기 캐릭터 정보에 활용
- 전투 알림: 레드 깜빡임 배너
- 스캔라인/노이즈 오버레이: 랜딩보다 옅게 적용
- 애니메이션: 최소화 (정보 밀도 + 가독성 우선)

---

## 3. 모바일 퍼스트 레이아웃

### 네비게이션: 하단 탭 바 (5개)
| 탭 | 아이콘 | 화면 |
|---|---|---|
| Home | 피드 | 메인 대시보드 (개인 상태 + 공지 + 요약) |
| Lore | 북 | 세계관 입문 허브 (`/world`) |
| Operation | 검+채팅 | 전투/RP 통합 작전 허브 (통합 리스트) |
| Registry | 명부 | 러닝 멤버 실시간 프로필 목록 |
| Helios Core | 코어 | 스토리 브리핑/타임라인/운영 공지 |
| My | 프로필 | 상단 아바타 진입 마이페이지 + 설정 |

### 데스크탑 대응
- 모바일 레이아웃 기본, md: 이상에서 사이드바 전환
- 전투/RP 채팅은 데스크탑에서 넓은 영역 활용

---

## 4. API 공통 규칙

### 설계 원칙
- **RESTful** 아키텍처
- **인증**: Supabase Auth JWT (Bearer token)
- **ID 형식**: nanoid(12) (예: `a1b2c3d4e5f6`)
- **삭제 방식**: Soft delete (`deleted_at` 필드 업데이트)
- **관리자 API**: `/api/admin/*` 경로

### 공통 헤더
```
Authorization: Bearer {supabase_jwt_token}
Content-Type: application/json
```

### 공통 에러 응답
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

### 에러 코드
- `UNAUTHORIZED`: 인증 실패 (401)
- `FORBIDDEN`: 권한 없음 (403)
- `NOT_FOUND`: 리소스 없음 (404)
- `VALIDATION_ERROR`: 입력 검증 실패 (400)
- `CONFLICT`: 리소스 충돌 (409)
- `INTERNAL_ERROR`: 서버 오류 (500)

### Rate Limiting
| 엔드포인트 | 제한 |
|---|---|
| AI GM 판정 | 분당 10회 (전투당) |
| 메시지 전송 (전투/RP) | 분당 30회 |
| 캐릭터 생성 | 시간당 3회 |
| 뉴스 리액션 | 분당 20회 |
| 일반 API | 분당 60회 |
| Admin API | 분당 120회 |

### 페이지네이션
- **채팅 (전투/RP):** 커서 기반 (created_at 기준, 최신→과거 방향, 기본 50건)
- **뉴스 피드:** 커서 기반 (published_at)
- **목록 조회:** 오프셋 기반 (기본 20건, 최대 100건)

### Realtime 구독 패턴 (Supabase Realtime)
| 채널 | 테이블 | 이벤트 | 용도 |
|---|---|---|---|
| `operation:{id}` | operation_turns | INSERT, UPDATE | 새 서술/판정 실시간 반영 |
| `operation:{id}` | operations | UPDATE | 상태 변경 (턴 교대, 종료) |
| `room:{id}` | room_messages | INSERT | RP 메시지 실시간 |
| `room:{id}` | operations | UPDATE | 방 상태 변경 |
| `notifications:{userId}` | notifications | INSERT | 실시간 알림 벨 |
| `ticker` | ticker_entries | INSERT | Solaris Ticker 실시간 |

---

## 5. DB 공통 규칙

**Database:** Supabase PostgreSQL
**ID Strategy:** nanoid(12) generated at application layer
**Soft Delete:** All tables include `deleted_at timestamptz NULL`

### ID 생성 (Application Layer)
```typescript
import { nanoid } from 'nanoid';
const newId = nanoid(12); // 예: "V1StGXR8_Z5j"
```

### Soft Delete 패턴
```sql
UPDATE characters SET deleted_at = now() WHERE id = 'xxx';
-- API 응답에서 deleted_at IS NULL인 리소스만 반환
```

### updated_at 자동 갱신
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 모든 테이블에 적용
CREATE TRIGGER update_{table}_updated_at BEFORE UPDATE ON {table}
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 6. Discord 알림 시스템

모든 알림은 Discord 임베드 + 웹 딥링크 형태.

| 이벤트 | 알림 내용 | 딥링크 |
|---|---|---|
| 캐릭터 승인 | "캐릭터 [이름]이 승인되었습니다" | /character/[id] |
| 캐릭터 반려 | "수정이 필요합니다: [사유]" | /character/create (수정 모드) |
| 전투 초대 | "[방 이름]에 전투 초대" | /operation/[id] |
| 내 턴 도래 | "전투에서 당신의 차례입니다" | /operation/[id] |
| 전투 결과 | "전투 종료: [결과 요약]" | /operation/[id] |
| RP 초대 | "[방 이름]에 초대되었습니다" | /room/[id] |
| 서사 반영 요청 | "서사 반영 동의가 필요합니다" | /room/[id] |
| 도시 뉴스 | 뉴스 제목 + 미리보기 | /dashboard |
| 시즌 이벤트 | 시즌 관련 공지 | /dashboard |

---

## 7. 이미지 스토리지 (Supabase Storage)

- **버킷:** `character-profile-images`
- **경로:** `{character_id}/{filename}`
- **사이즈 제한:** 최대 5MB
- **포맷:** JPG, PNG, WebP
- **업로드:** signed URL + service_role (RLS 우회)
- **RLS:** 누구나 읽기, 본인 캐릭터만 쓰기

---

## 8. MVP 스코프 (시즌 0)

### Phase 1 — 런칭 필수
1. Discord OAuth 로그인
2. 캐릭터 생성 위자드 + 캐릭터 프로필
3. 관리자 승인 패널
4. Home 대시보드 (개인 상태 + 커뮤니티 요약)
5. Lore 허브 (`/world`)
6. Operation 통합 허브 (전투/RP 통합 리스트 + 공통 세션 UX)
7. Registry (실시간 상태 + 모달 프로필)
8. Helios Core (스토리 브리핑 + 전개 타임라인)
9. 진영별 기밀 게시판
10. 캐릭터 관계도 (수동 입력)
11. Solaris Ticker (대시보드 상단 실시간 시보)
12. Discord 알림 봇
13. 인프라: Realtime 채널, 이미지 스토리지, OG 메타태그, 페이지네이션, Rate Limiting

### Phase 2 — 런칭 후 1~2주
14. 전투 로그 공유 (AI GM 결정적 장면 이미지 카드)
15. 캐릭터 관계도 AI 자동 태그
16. 전투 → 뉴스 자동 반영
17. GM 바이어스 슬라이더
18. 시즌 대시보드 (통계)

### Phase 3 — 시즌 0 중반
19. 소모성 아이템 + 인벤토리
20. 크레딧 재화 시스템
21. 전투 아카이브 소셜 기능

---

## 9. 개발 가이드

### 환경변수
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
DISCORD_CLIENT_ID=123456789012345678
DISCORD_CLIENT_SECRET=xxx
DISCORD_BOT_TOKEN=xxx
GEMINI_API_KEY=AIzaSy...
```

### 캐릭터 수정 후 재승인
- **능력 수정 (이름, 설명, 약점, 코스트):** 재승인 필요 → status='revision'
- **프로필 수정 (외형, 배경, 이미지):** 자동 통과, 재승인 불필요
- **팩션/능력 계열 변경:** 불가 (캐릭터 삭제 후 재생성만 허용)

### OG 메타태그
- **캐릭터 프로필:** `og:title`=캐릭터 이름, `og:image`=프로필 이미지
- **전투 아카이브:** `og:title`="[A] vs [B]", `og:description`=GM 판정 한줄 요약
- **뉴스:** `og:title`=BULLETIN 제목, `og:description`=본문 미리보기
- 구현: Next.js `generateMetadata` 활용

---

## 10. 참고 문서

- **세계관:** `docs/WORLDBUILDING.md`
- **랜딩 스펙:** `docs/LANDING-SPEC.md`
- **랜딩 카피:** `docs/LANDING-COPY.md`
- **운영 규약:** `CLAUDE.md`
