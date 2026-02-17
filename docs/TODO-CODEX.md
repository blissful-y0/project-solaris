# Dashboard TODO — Codex 작업 목록

> 대시보드 IA 개편 후 남은 작업. 우선순위별 정리.

---

## 작업 분담

현재 세션의 Claude Code가 아래 **본 작업**을 먼저 처리 중:
- 네비게이션 IA v2 (5탭 + TopBar MY 아이콘)
- 플레이스홀더 페이지 5개 (`/world`, `/session`, `/characters`, `/core`, `/my`)
- 로그아웃 기능 (`/my` 페이지)
- 보안 헤더 (`next.config.mjs`)

**Codex는 이 문서의 T1~T14를 담당한다.**
본 작업이 develop에 머지된 후, Codex가 feature branch를 따서 작업한다.

---

## 의존성 & 병렬 실행 가이드

### 의존성 그래프

```
T2 (env 검증) ──→ T1 (auth 테스트)       # T2가 middleware/callback 파일을 변경하므로 T1보다 먼저
T3 + T12 + T13                            # 같은 파일(page.tsx) 수정 — 하나로 묶어서 순차 처리
```

### 병렬 슬롯 구성 (추천)

| 슬롯 | 항목 | 설명 | 비고 |
|------|------|------|------|
| 1 | T2 → T1 | Auth 인프라 | **순차** (T2 먼저) |
| 2 | T3 + T12 + T13 | 홈페이지 일괄 수정 | **순차 또는 합치기** (같은 파일) |
| 3 | T4 | REGISTRY UI | 독립 |
| 4 | T5 | Session UI | 독립 |
| 5 | T6 | Helios Core UI | 독립 |
| 6 | T7 | Lore 페이지 | 독립 |
| 7 | T8 | Ticker 컴포넌트 | 독립 |
| 8 | T9, T10, T11, T14 | 소규모 독립 작업 | 각각 다른 파일, **완전 병렬 가능** |

### 충돌 파일 매트릭스

| 파일 | 관련 항목 |
|------|-----------|
| `src/lib/supabase/middleware.ts` | T1, T2 |
| `src/lib/supabase/client.ts` | T2 |
| `src/lib/supabase/server.ts` | T2 |
| `src/app/api/auth/callback/route.ts` | T1, T2 |
| `src/app/(dashboard)/page.tsx` | T3, T12, T13 |

---

## 높음 우선순위

### T1. Auth 미들웨어/콜백 테스트 커버리지

> **의존성**: T2 완료 후 진행 (T2가 middleware/callback 파일 변경)

**현황**: 보안 경계 코드인데 테스트 0%.

**작업 내용**:
- `src/lib/supabase/middleware.ts`의 `updateSession` 유닛 테스트
  - 미인증 + 비공개 경로 → `/login` 리다이렉트
  - 인증 + `/login` → `/` 리다이렉트
  - 공개 경로 → 통과
- `src/app/api/auth/callback/route.ts` 테스트
  - 유효 code → 세션 교환 → next 경로로 리다이렉트
  - 무효 code → `/login?error=auth_failed`
  - open redirect 방어 (`//evil.com` 차단)

**관련 파일**:
- `src/lib/supabase/middleware.ts`
- `src/app/api/auth/callback/route.ts`

---

### T2. 환경변수 Zod 검증

> **의존성**: 없음 (선행 작업). T1이 이 작업에 의존.

**현황**: `process.env.NEXT_PUBLIC_SUPABASE_URL!` 같은 non-null assertion 사용 중. 런타임 에러 가능성.

**작업 내용**:
- `src/lib/env.ts` 생성
- Zod 스키마로 환경변수 런타임 검증
- 실패 시 명확한 에러 메시지 (어떤 변수가 빠졌는지)
- 아래 파일에서 `process.env.XXX!` 패턴 전부 교체:
  - `src/lib/supabase/client.ts`
  - `src/lib/supabase/server.ts`
  - `src/lib/supabase/middleware.ts`
  - `src/app/api/auth/callback/route.ts`

**참고**: `zod`는 이미 의존성에 포함되어 있을 수 있음. 없으면 추가 필요.

---

### T3. 홈페이지 getUser 에러 핸들링

> **의존성**: T12, T13과 같은 파일 수정 — 같은 슬롯에서 순차 처리 권장

**현황**: `src/app/(dashboard)/page.tsx`에서 `getUser()` 호출 시 에러 처리 없음.

**작업 내용**:
- `getUser()` promise에 `.catch()` 추가
- 로딩 상태 표시 (Skeleton 컴포넌트 활용)
- 에러 상태 표시 (에러 메시지 + 재시도 버튼)

**관련 파일**:
- `src/app/(dashboard)/page.tsx`
- `src/components/ui/Skeleton.tsx` (기존 컴포넌트)

---

## 중간 우선순위

### T4. REGISTRY (도감) 목 데이터 UI

> **의존성**: 없음 (독립)

**현황**: `/characters` 페이지에 플레이스홀더만 존재.

**작업 내용**:
- 캐릭터 카드 그리드 레이아웃
- 팩션 필터 (Bureau / Static / 전체)
- 프로필 상세 모달 (기존 Modal 컴포넌트 활용)
- 목 데이터 5~6개 캐릭터 (진영, 능력 계열, 이름, 아바타)

**디자인 참고**:
- 카드: `Card` 컴포넌트 + `hud` prop
- 진영 컬러: Bureau=#00d4ff (시안), Static=#dc2626 (레드)
- Badge 컴포넌트로 팩션 표시

---

### T5. Session 허브 상세 UI

> **의존성**: 없음 (독립)

**현황**: `/session` 페이지에 전투/RP 선택 카드만 존재.

**작업 내용**:
- 전투 목록 (BattleLobbyCard) 목 데이터
- RP 방 목록 (RoomCard) 목 데이터
- 모드 선택 탭/토글
- 각 카드에 참여자 수, 상태(대기중/진행중) 표시

---

### T6. Helios Core 타임라인 UI

> **의존성**: 없음 (독립)

**현황**: `/core` 페이지에 플레이스홀더만 존재.

**작업 내용**:
- 스토리 브리핑 타임라인 (BriefingFeed 패턴 재활용 가능)
- 관리자 공지 섹션
- 전투 하이라이트 카드
- "ARC" (사건 발생 시스템) 진행 상태 표시

---

### T7. Lore (세계관) 페이지

> **의존성**: 없음 (독립)

**현황**: `/world` 페이지에 플레이스홀더만 존재.

**작업 내용**:
- 세계관 문서 렌더링 (마크다운 또는 하드코딩)
- 섹션별 구성: 도시 소개, 진영, 능력 체계, 일상 등
- 하단 CTA → `/character/create` 유도

**세계관 참고**: `docs/WORLDBUILDING.md`

---

### T8. Solaris Ticker 컴포넌트

> **의존성**: 없음 (독립)

**현황**: 미구현. TopBar 아래에 뉴스 티커 필요.

**작업 내용**:
- 상단 marquee CSS 애니메이션 (prefers-reduced-motion 존중)
- 목 데이터 (`ticker_entries` 형식: id, text, priority, timestamp)
- TopBar 아래 고정 위치
- `@layer base` 안에서 애니메이션 정의

**주의**: Tailwind v4에서 unlayered CSS 금지. `@layer base` 안에서 선언.

---

## 낮음 우선순위

### T9. 로그인 페이지 에러/로딩 상태 보강

> **의존성**: 없음 (독립)

- OAuth 에러 시 에러 메시지 표시 + 테스트
- 네트워크 에러 시 에러 메시지 표시 + 테스트
- 로딩 스피너 표시 + 테스트

**관련 파일**: `src/app/login/page.tsx`

---

### T10. Modal body scroll lock 테스트

> **의존성**: 없음 (독립)

- open → `overflow: hidden` 확인
- close → `overflow` 복원 확인

**관련 파일**: `src/components/ui/__tests__/Modal.test.tsx`

---

### T11. 네비게이션 aria-current="page" 추가

> **의존성**: 없음 (독립)

- `MobileTabBar`, `DesktopSidebar` 활성 탭에 `aria-current="page"` 속성 추가
- 스크린 리더 접근성 향상

**관련 파일**:
- `src/components/layout/MobileTabBar.tsx`
- `src/components/layout/DesktopSidebar.tsx`

---

### T12. avatar_url Discord CDN 검증

> **의존성**: T3, T13과 같은 파일 수정 — 같은 슬롯에서 순차 처리 권장

- `getAvatarUrl`에서 `https://cdn.discordapp.com/` 패턴만 허용
- 비 Discord URL 차단 (보안)

**관련 파일**: `src/app/(dashboard)/page.tsx`

---

### T13. displayName 길이 제한

> **의존성**: T3, T12와 같은 파일 수정 — 같은 슬롯에서 순차 처리 권장

- `getDisplayName`에서 최대 32자 truncate
- Unicode 제어 문자 제거 (XSS 방지)

**관련 파일**: `src/app/(dashboard)/page.tsx`

---

### T14. BriefingFeed useMemo 최적화

> **의존성**: 없음 (독립)

- 정렬 로직을 `useMemo`로 감싸기
- 불필요한 리렌더링 방지

**관련 파일**: `src/components/home/BriefingFeed.tsx`

---

## 공통 참고사항

- **테스트 프레임워크**: Vitest + @testing-library/react
- **UI 컴포넌트**: `@/components/ui` (Button, Card, Badge, Modal, Input, Skeleton)
- **레이아웃**: `@/components/layout` (DashboardLayout, TopBar, MobileTabBar, DesktopSidebar)
- **스타일**: Tailwind CSS v4 — `@layer base` 안에서 커스텀 CSS 선언
- **한국어**: UI 텍스트 + 코드 주석 + 커밋 메시지 모두 한국어
- **HUD 라벨**: `<p className="hud-label">LABEL TEXT</p>` 패턴
- **cn() 유틸**: `import { cn } from "@/lib/utils"` (clsx 래퍼)
